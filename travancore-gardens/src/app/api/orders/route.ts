import { NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
    try {
        // 1. Check optional authenticated user session
        let userId: string | null = null;
        try {
            const supabaseUser = await createServerSupabase();
            const { data: { user } } = await supabaseUser.auth.getUser();
            if (user) {
                userId = user.id;
            }
        } catch {
            // Unauthenticated guest request
        }

        // 2. Build Supabase Admin client using Service Role Key
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error("❌ Missing Supabase service credentials in API orders route");
            return NextResponse.json({ error: "Server database configuration missing" }, { status: 500 });
        }

        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            { auth: { persistSession: false } }
        );

        const body = await request.json();
        const {
            items,
            address,         // { full_name, phone, email, address_line1, address_line2, city, state, pincode }
            address_id,      // optional existing address ID (for logged-in users)
            user_id: bodyUserId,
            total_amount,
            shipping_cost = 0,
            discount_amount = 0,
            weight = 0.5,
            coupon_code = null,
            payment_method = "card",
            notes = null,
        } = body;

        const finalUserId = userId || bodyUserId || null;

        // Validation
        if (!items?.length || total_amount === undefined) {
            return NextResponse.json({ error: "Order must contain at least one item and a total amount." }, { status: 400 });
        }

        // 3. Resolve Address ID
        let resolvedAddressId = address_id;
        if (!resolvedAddressId && address) {
            const { data: newAddr, error: addrErr } = await supabaseAdmin
                .from("addresses")
                .insert({
                    user_id: finalUserId,
                    full_name: address.full_name?.trim() || "Customer",
                    name: address.full_name?.trim() || "Customer",
                    phone: address.phone?.trim() || "",
                    address_line1: address.address_line1?.trim() || "",
                    address_line2: address.address_line2?.trim() || "",
                    line1: address.address_line1?.trim() || "",
                    line2: address.address_line2?.trim() || "",
                    city: address.city?.trim() || "",
                    state: address.state?.trim() || "",
                    pincode: address.pincode?.trim() || "",
                    country: address.country || "India",
                })
                .select()
                .single();

            if (addrErr) {
                console.error("❌ Address creation failed:", addrErr);
                return NextResponse.json({ error: addrErr.message || "Failed to save shipping address" }, { status: 500 });
            }
            resolvedAddressId = newAddr.id;
        }

        if (!resolvedAddressId) {
            return NextResponse.json({ error: "A valid shipping address is required." }, { status: 400 });
        }

        // Build metadata/notes
        const guestEmail = address?.email?.trim() || null;
        let orderNotes = notes;
        if (!orderNotes && guestEmail) {
            orderNotes = JSON.stringify({ email: guestEmail, guest: !userId });
        }

        // Generate unique order number (e.g. TG-XXXXXX)
        const orderNumber = `TG-${Date.now().toString(36).toUpperCase()}`;

        // 4. Create Order
        const { data: order, error: orderErr } = await supabaseAdmin
            .from("orders")
            .insert({
                order_number: orderNumber,
                user_id: finalUserId,
                address_id: resolvedAddressId,
                total_amount,
                shipping_cost,
                shipping_amount: shipping_cost,
                discount_amount,
                weight,
                coupon_code,
                payment_method,
                payment_status: "pending",
                order_status: "pending",
                status: "pending",
                notes: orderNotes,
            })
            .select()
            .single();

        if (orderErr) {
            console.error("❌ Order creation failed:", orderErr);
            return NextResponse.json({ error: orderErr.message || "Failed to create order" }, { status: 500 });
        }

        // 5. Update coupon usage count if applied
        if (coupon_code) {
            const { data: coupon } = await supabaseAdmin
                .from("coupons")
                .select("id, usage_count")
                .eq("code", coupon_code)
                .single();

            if (coupon) {
                await supabaseAdmin
                    .from("coupons")
                    .update({ usage_count: (coupon.usage_count || 0) + 1 })
                    .eq("id", coupon.id);
            }
        }

        // 6. Insert Order Items
        const orderItems = items.map((i: any) => ({
            order_id: order.id,
            product_id: i.product_id,
            product_name: i.name || "Plant",
            product_image_url: i.image_url || null,
            quantity: i.quantity,
            price: i.sale_price ?? i.price,
            unit_price: i.sale_price ?? i.price,
            total_price: (i.sale_price ?? i.price) * i.quantity,
        }));

        const { error: itemsErr } = await supabaseAdmin
            .from("order_items")
            .insert(orderItems);

        if (itemsErr) {
            console.error("❌ Order items insertion failed:", itemsErr);
            return NextResponse.json({ error: itemsErr.message || "Failed to save order items" }, { status: 500 });
        }

        return NextResponse.json({ order }, { status: 201 });
    } catch (err: any) {
        console.error("❌ Unexpected error in API orders route:", err);
        return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const supabase = await createServerSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json([]);

        const { data, error } = await supabase
            .from("orders")
            .select("*, order_items(*)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
    }
}

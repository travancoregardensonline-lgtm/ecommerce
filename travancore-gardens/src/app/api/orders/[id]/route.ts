import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * Admin: Update order status / payment status
 */
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabase
        .from("orders")
        .update(body)
        .eq("id", id)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

/**
 * Get order details by ID (Supports both logged-in users and guest order receipts)
 */
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        let currentUser: any = null;
        try {
            const supabase = await createServerSupabase();
            const { data: { user } } = await supabase.auth.getUser();
            currentUser = user;
        } catch {
            // Guest requester
        }

        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json({ error: "Server configuration missing" }, { status: 500 });
        }

        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            { auth: { persistSession: false } }
        );

        const { data: order, error } = await supabaseAdmin
            .from("orders")
            .select(`
                *,
                order_items(
                    id, quantity, price,
                    products(id, name, slug, product_images(image_url, is_primary))
                ),
                addresses(*)
            `)
            .eq("id", id)
            .maybeSingle();

        if (error || !order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Security check: If order has an owner user_id, ensure requester is the owner or an admin
        if (order.user_id) {
            if (!currentUser) {
                return NextResponse.json({ error: "Please log in to view this order" }, { status: 401 });
            }

            if (currentUser.id !== order.user_id) {
                const { data: profile } = await supabaseAdmin
                    .from("profiles")
                    .select("role")
                    .eq("id", currentUser.id)
                    .maybeSingle();

                const isAdmin = profile?.role === "admin" || profile?.role === "manager" || profile?.role === "super_admin";
                if (!isAdmin) {
                    return NextResponse.json({ error: "Access denied" }, { status: 403 });
                }
            }
        }

        return NextResponse.json(order);
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
    }
}

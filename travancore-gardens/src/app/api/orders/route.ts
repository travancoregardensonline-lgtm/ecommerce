import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    // Validate required fields
    const { items, address_id, total_amount, shipping_amount = 0, discount_amount = 0, payment_method } = body;
    if (!items?.length || !total_amount) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create the order
    const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
            user_id: user.id,
            status: "pending",
            total_amount,
            shipping_amount,
            discount_amount,
            address_id,
            payment_status: "pending",
            payment_method,
        })
        .select()
        .single();

    if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 });

    // Insert order items
    const orderItems = items.map((item: {
        product_id: string;
        product_name: string;
        product_image_url?: string;
        quantity: number;
        unit_price: number;
    }) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image_url: item.product_image_url,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 });

    return NextResponse.json({ order }, { status: 201 });
}

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

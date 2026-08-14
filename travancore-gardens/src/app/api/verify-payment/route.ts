import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { createShiprocketOrder } from '@/lib/shiprocket';
import { sendSentDMMessage } from '@/lib/sentdm';


export async function POST(req: Request) {
    try {
        const payload = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, supabase_order_id } = payload;

        // --- Validate required fields ---
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !supabase_order_id) {
            return NextResponse.json({ error: "Missing required payment fields." }, { status: 400 });
        }

        if (!process.env.RAZORPAY_KEY_SECRET) {
            console.error("RAZORPAY_KEY_SECRET is not set");
            return NextResponse.json({ error: "Payment gateway configuration missing." }, { status: 500 });
        }

        if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
            console.error("Supabase Service Role Key is not set");
            return NextResponse.json({ error: "Database configuration missing." }, { status: 500 });
        }

        // 1. Verify Razorpay Signature
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            console.error("Signature mismatch:", { generated: generatedSignature, received: razorpay_signature });
            return NextResponse.json({ error: "Invalid payment signature. Payment could not be verified." }, { status: 400 });
        }

        // 2. Build Supabase admin client with service role key
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            { auth: { persistSession: false } }
        );

        // 3. Fetch the corresponding order details from Supabase
        const { data: orderDB, error: fetchErr } = await supabaseAdmin
            .from("orders")
            .select(`
                *,
                profiles(name, email, phone),
                addresses(full_name, phone, address_line1, address_line2, city, state, pincode, country),
                order_items(
                    quantity,
                    price,
                    products(name, sku, weight)
                )
            `)
            .eq("id", supabase_order_id)
            .single();

        if (fetchErr) {
            console.error("Order fetch failed:", fetchErr.message);
            return NextResponse.json({ error: `Order not found: ${fetchErr.message}` }, { status: 404 });
        }

        // 4. Insert payment record
        const { error: paymentErr } = await supabaseAdmin.from("payments").insert({
            order_id: supabase_order_id,
            payment_gateway: "razorpay",
            transaction_id: razorpay_payment_id,
            amount: orderDB.total_amount,
            payment_status: "paid"
        });
        if (paymentErr) {
            console.error("Payment insert error:", paymentErr.message);
        }

        // 5. Update order status
        await supabaseAdmin.from("orders")
            .update({ payment_status: "paid", order_status: "confirmed" })
            .eq("id", supabase_order_id);

        // 6. Push to Shiprocket (non-blocking — failure won't reject the payment)
        if (process.env.SHIPROCKET_EMAIL || process.env.SHIPROCKET_API_TOKEN) {
            // ─── Calculate Package Dimensions and Weight ───────────────────────
            const items = orderDB.order_items || [];
            let totalWeight = 0;
            let totalVolume = 0;
            let maxL = 20, maxB = 15;

            items.forEach((item: any) => {
                const itemQty = Number(item.quantity || 1);
                // Weight: Product weight (fallback 0.8kg to account for soil/pot)
                const unitWeight = Number(item.products?.weight || 0.8);
                totalWeight += unitWeight * itemQty;

                // Box Dimensions (L x W x H)
                const l = Number(item.products?.length || 20);
                const b = Number(item.products?.width || 15);
                const h = Number(item.products?.height || 20);

                totalVolume += (l * b * h) * itemQty;
                if (l > maxL) maxL = l;
                if (b > maxB) maxB = b;
            });

            // Estimate final box height based on volume and footprint
            const footprint = maxL * maxB;
            const estimatedH = Math.ceil(totalVolume / footprint);
            const finalH = Math.max(estimatedH, 20);

            const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION || "ambalathinkala warehouse";
            const shiprocketPayload = {
                order_id: `TG-${supabase_order_id.substring(0, 8).toUpperCase()}`,
                order_date: new Date().toISOString().replace('T', ' ').substring(0, 19),
                pickup_location: pickupLocation,
                billing_customer_name: orderDB.addresses?.full_name || orderDB.profiles?.name || "Guest",
                billing_last_name: "",
                billing_address: orderDB.addresses?.address_line1 || "N/A",
                billing_address_2: orderDB.addresses?.address_line2 || "",
                billing_city: orderDB.addresses?.city || "N/A",
                billing_pincode: orderDB.addresses?.pincode || "000000",
                billing_state: orderDB.addresses?.state || "N/A",
                billing_country: orderDB.addresses?.country || "India",
                billing_email: orderDB.profiles?.email || "orders@trvancogardens.com",
                billing_phone: orderDB.addresses?.phone || orderDB.profiles?.phone || "0000000000",
                shipping_is_billing: true,
                order_items: (orderDB.order_items || []).map((item: any, idx: number) => ({
                    name: item.products?.name || "Plant",
                    sku: item.products?.sku || `SKU-${Date.now()}-${idx}`,
                    units: item.quantity,
                    selling_price: item.price,
                })),
                payment_method: "Prepaid",
                sub_total: orderDB.total_amount,
                length: maxL,
                breadth: maxB,
                height: finalH,
                weight: Math.max(0.5, totalWeight)
            };

            try {
                const srRes = await createShiprocketOrder(shiprocketPayload);
                // Shiprocket returns order_id and shipment_id at top level
                const srOrderId = srRes?.order_id ?? srRes?.payload?.order_id;
                const srShipmentId = srRes?.shipment_id ?? srRes?.payload?.shipment_id;
                console.log("✅ Shiprocket order created — order_id:", srOrderId, "shipment_id:", srShipmentId);
                console.log("📦 Full Shiprocket response:", JSON.stringify(srRes, null, 2));

                // Save Shiprocket IDs back to our order record
                if (srOrderId || srShipmentId) {
                    await supabaseAdmin.from("orders").update({
                        ...(srShipmentId && { shiprocket_shipment_id: String(srShipmentId) }),
                    }).eq("id", supabase_order_id);
                }
            } catch (srErr: unknown) {
                const errMsg = srErr instanceof Error ? srErr.message : String(srErr);
                console.error("⚠️ Shiprocket failed (non-blocking):", errMsg);
                // Do NOT throw — payment is confirmed, Shiprocket is non-critical
            }
        }

        // 7. Send Order Confirmation Notification via sent.dm (non-blocking)
        const customerPhone = orderDB.addresses?.phone || orderDB.profiles?.phone;
        if (customerPhone) {
            const customerName = orderDB.addresses?.full_name || orderDB.profiles?.name || 'Customer';
            const orderRef = `TG-${supabase_order_id.substring(0, 8).toUpperCase()}`;
            const totalVal = orderDB.total_amount;
            
            const welcomeMsg = `Hi *${customerName}*,\n\nYour order *${orderRef}* of ₹${totalVal} has been successfully placed at *Travancore Gardens*! 🌱\n\nWe are preparing your plants for shipping. You will receive tracking details once shipped. Thank you!`;
            
            try {
                // Non-blocking call
                sendSentDMMessage({
                    to: [customerPhone],
                    text: welcomeMsg,
                    channels: ['whatsapp', 'sms']
                });
            } catch (sentDmErr) {
                console.error('⚠️ sent.dm Order notification failed:', sentDmErr);
            }
        }

        return NextResponse.json({
            success: true,
            message: "Payment verified and order confirmed!"
        });

    } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e);
        console.error("❌ Payment verification error:", errMsg);
        return NextResponse.json({ error: `Payment verification failed: ${errMsg}` }, { status: 500 });
    }
}

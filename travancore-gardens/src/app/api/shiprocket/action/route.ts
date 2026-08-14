import { NextResponse } from 'next/server';
import { generateAWB, generatePickup, generateManifest, cancelShiprocketOrder } from '@/lib/shiprocket';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
);

// Extract the human-readable message from Shiprocket/axios errors
function extractError(err: unknown): string {
    const e = err as any;
    // Shiprocket embeds its message in the axios response body
    return e?.response?.data?.message
        ?? e?.response?.data?.error
        ?? (e instanceof Error ? e.message : String(e));
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, shipment_id, shipment_ids, courier_id, order_id, supabase_order_id } = body;

        switch (action) {

            // ── Assign AWB ────────────────────────────────────────────────────
            case 'generate_awb': {
                if (!shipment_id || !courier_id) {
                    return NextResponse.json(
                        { error: 'shipment_id and courier_id are required' }, { status: 400 }
                    );
                }
                let data: any;
                try {
                    data = await generateAWB(shipment_id, courier_id);
                } catch (err) {
                    const msg = extractError(err);
                    console.error('AWB generation failed:', msg);
                    return NextResponse.json({ error: msg }, { status: 422 });
                }

                // Shiprocket responds with status_code 350 if wallet is low
                if (data?.status_code === 350 || data?.message?.toLowerCase().includes('recharge')) {
                    return NextResponse.json(
                        { error: `Shiprocket Wallet: ${data.message}` }, { status: 402 }
                    );
                }

                const awbCode = data?.response?.data?.awb_code;
                console.log('✅ AWB generated:', awbCode, '| Full response:', JSON.stringify(data));

                // Save AWB + shipment_id back to our Supabase order
                if (supabase_order_id && awbCode) {
                    await supabaseAdmin()
                        .from('orders')
                        .update({
                            tracking_number: awbCode,
                            shiprocket_shipment_id: String(shipment_id),
                            order_status: 'processing',
                        })
                        .eq('id', supabase_order_id);
                }
                return NextResponse.json({ ...data, awb_code: awbCode });
            }

            // ── Schedule Pickup ───────────────────────────────────────────────
            case 'generate_pickup': {
                const ids = shipment_ids ?? (shipment_id ? [shipment_id] : null);
                if (!ids?.length) {
                    return NextResponse.json({ error: 'shipment_ids required' }, { status: 400 });
                }
                try {
                    const data = await generatePickup(ids);
                    console.log('✅ Pickup scheduled:', JSON.stringify(data));
                    return NextResponse.json(data);
                } catch (err) {
                    return NextResponse.json({ error: extractError(err) }, { status: 422 });
                }
            }

            // ── Generate Manifest ─────────────────────────────────────────────
            case 'generate_manifest': {
                const ids = shipment_ids ?? (shipment_id ? [shipment_id] : null);
                if (!ids?.length) {
                    return NextResponse.json({ error: 'shipment_ids required' }, { status: 400 });
                }
                try {
                    const data = await generateManifest(ids);
                    console.log('✅ Manifest generated:', JSON.stringify(data));
                    return NextResponse.json(data);
                } catch (err) {
                    return NextResponse.json({ error: extractError(err) }, { status: 422 });
                }
            }

            // ── Cancel Order ─────────────────────────────────────────────────
            case 'cancel': {
                if (!order_id) {
                    return NextResponse.json({ error: 'order_id required' }, { status: 400 });
                }
                try {
                    const data = await cancelShiprocketOrder(order_id);
                    if (supabase_order_id) {
                        await supabaseAdmin()
                            .from('orders')
                            .update({ order_status: 'cancelled' })
                            .eq('id', supabase_order_id);
                    }
                    return NextResponse.json(data);
                } catch (err) {
                    return NextResponse.json({ error: extractError(err) }, { status: 422 });
                }
            }

            default:
                return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
        }
    } catch (err: unknown) {
        const msg = extractError(err);
        console.error('Shiprocket action error:', msg);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

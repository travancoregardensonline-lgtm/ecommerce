import { NextResponse } from 'next/server';
import { trackByAWB, getShipmentTracking } from '@/lib/shiprocket';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const awb = searchParams.get('awb');
        const shipmentId = searchParams.get('shipment_id');

        if (awb) {
            const data = await trackByAWB(awb);
            return NextResponse.json(data);
        }
        if (shipmentId) {
            const data = await getShipmentTracking(shipmentId);
            return NextResponse.json(data);
        }
        return NextResponse.json({ error: 'Provide awb or shipment_id' }, { status: 400 });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

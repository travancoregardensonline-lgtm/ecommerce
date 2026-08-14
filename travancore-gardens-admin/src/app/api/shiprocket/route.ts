import { NextResponse } from 'next/server';
import {
    getShiprocketOrders,
    getPickupLocations,
    getAvailableCouriers,
} from '@/lib/shiprocket';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') ?? 'orders';
        const page = Number(searchParams.get('page') ?? 1);

        if (type === 'pickup') {
            const data = await getPickupLocations();
            return NextResponse.json(data);
        }

        if (type === 'couriers') {
            const pickup = searchParams.get('pickup') ?? '695572';
            const delivery = searchParams.get('delivery') ?? '110001';
            const weight = Number(searchParams.get('weight') ?? '0.5');
            const data = await getAvailableCouriers(pickup, delivery, weight);
            return NextResponse.json(data);
        }

        const data = await getShiprocketOrders(page);
        return NextResponse.json(data);
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('Shiprocket GET error:', msg);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

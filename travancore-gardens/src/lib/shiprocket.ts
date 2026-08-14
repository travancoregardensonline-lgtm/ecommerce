import axios from 'axios';

const SR_BASE = 'https://apiv2.shiprocket.in/v1/external';

// Token is cached in memory — avoids hammering the login API on every request
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

export async function getShiprocketToken(): Promise<string> {
    // ── Priority 1: Use a pre-generated API token (bypasses 2FA) ──────────────
    const staticToken = process.env.SHIPROCKET_API_TOKEN;
    if (staticToken && staticToken.trim().length > 20) {
        return staticToken.trim();
    }

    // ── Priority 2: Login with email/password (won't work if 2FA is on) ───────
    if (cachedToken && Date.now() < tokenExpiry) {
        return cachedToken;
    }

    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;
    if (!email || !password) {
        throw new Error(
            'Shiprocket is not configured. Set SHIPROCKET_API_TOKEN in your .env file ' +
            '(get it from Shiprocket Dashboard → Settings → API).'
        );
    }

    try {
        const response = await axios.post(`${SR_BASE}/auth/login`, { email, password });
        cachedToken = response.data.token;
        tokenExpiry = Date.now() + 22 * 60 * 60 * 1000; // 22 hours
        return cachedToken!;
    } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
        if (axiosErr.response?.status === 403) {
            throw new Error(
                'Shiprocket returned 403 — Two-Step Verification is likely enabled. ' +
                'Please generate an API token from Shiprocket Dashboard → Settings → API ' +
                'and add it as SHIPROCKET_API_TOKEN in your .env file.'
            );
        }
        throw new Error(
            `Shiprocket login failed: ${axiosErr.response?.data?.message ?? axiosErr.message}`
        );
    }
}


async function srGet(path: string) {
    const token = await getShiprocketToken();
    const res = await axios.get(`${SR_BASE}${path}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
}

async function srPost(path: string, body: object) {
    const token = await getShiprocketToken();
    const res = await axios.post(`${SR_BASE}${path}`, body, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    return res.data;
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function createShiprocketOrder(payload: object) {
    return srPost('/orders/create/adhoc', payload);
}

export async function getShiprocketOrders(page = 1, perPage = 20) {
    return srGet(`/orders?page=${page}&per_page=${perPage}&sort=DESC`);
}

export async function cancelShiprocketOrder(orderId: string | number) {
    return srPost('/orders/cancel', { ids: [orderId] });
}

// ─── Shipments ────────────────────────────────────────────────────────────────

export async function getShipmentTracking(shipmentId: string | number) {
    return srGet(`/courier/track/shipment/${shipmentId}`);
}

export async function trackByAWB(awb: string) {
    return srGet(`/courier/track/awb/${awb}`);
}

export async function generateAWB(shipmentId: string | number, courierId: number) {
    return srPost('/courier/assign/awb', { shipment_id: shipmentId, courier_id: courierId });
}

export async function generatePickup(shipmentIds: (string | number)[]) {
    return srPost('/courier/generate/pickup', { shipment_id: shipmentIds });
}

export async function generateManifest(shipmentIds: (string | number)[]) {
    return srPost('/manifests/generate', { shipment_id: shipmentIds });
}

export async function printManifest(orderId: string | number) {
    return srPost('/manifests/print', { order_ids: [orderId] });
}

// ─── Couriers ─────────────────────────────────────────────────────────────────

export async function getAvailableCouriers(pickupPostcode: string, deliveryPostcode: string, weight: number, cod = 0) {
    return srGet(`/courier/serviceability/?pickup_postcode=${pickupPostcode}&delivery_postcode=${deliveryPostcode}&weight=${weight}&cod=${cod}`);
}

// ─── Pickup Addresses ─────────────────────────────────────────────────────────

export async function getPickupLocations() {
    return srGet('/settings/company/pickup');
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export async function getShiprocketStats() {
    return srGet('/shipments?per_page=5');
}

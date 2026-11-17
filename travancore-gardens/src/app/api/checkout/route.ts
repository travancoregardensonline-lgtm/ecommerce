import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const { amount, currency = "INR", receipt } = await req.json();

        // Standard validation
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return NextResponse.json({ error: "Razorpay keys configuration missing" }, { status: 500 });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: Math.round(amount * 100), // Razorpay expects amount in the smallest currency unit (paise)
            currency,
            receipt,
            payment_capture: 1, // Auto-capture the payment
        };

        const razorpayOrder = await razorpay.orders.create(options);

        return NextResponse.json({
            id: razorpayOrder.id,
            currency: razorpayOrder.currency,
            amount: razorpayOrder.amount,
        });

    } catch (error: any) {
        console.error("Razorpay Order Error:", error?.error || error);
        const description = error?.error?.description || error?.message || "Failed to initialize payment gateway.";
        return NextResponse.json({ error: description }, { status: 500 });
    }
}

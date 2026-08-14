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

        // Optionally store the order map in Supabase if needed conceptually right here, 
        // but typically you do that down the line on successful payment.

        return NextResponse.json({
            id: razorpayOrder.id,
            currency: razorpayOrder.currency,
            amount: razorpayOrder.amount,
        });

    } catch (error: any) {
        console.error("Razorpay Order Error:", error);
        return NextResponse.json({ error: "Failed to initialize standard checkout." }, { status: 500 });
    }
}

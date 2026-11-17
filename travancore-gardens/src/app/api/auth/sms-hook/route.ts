import { NextResponse } from 'next/server';
import { sendSentDMMessage } from '@/lib/sentdm';

export async function POST(req: Request) {
    try {
        const rawBody = await req.text();
        console.log('📬 Received Supabase SMS Hook request:', rawBody);

        let payload: any = {};
        try {
            payload = JSON.parse(rawBody);
        } catch {
            return NextResponse.json({ success: true, message: 'Received non-JSON body' });
        }

        const phone = payload?.user?.phone;
        const otp = payload?.sms?.otp;

        if (!phone || !otp) {
            return NextResponse.json({ success: true, message: 'No phone or otp in payload' });
        }

        // Try sent.dm if configured, but never fail the request
        try {
            const templateId = process.env.SENTDM_OTP_TEMPLATE_ID;
            if (templateId) {
                await sendSentDMMessage({
                    to: [phone],
                    templateId,
                    templateParameters: { code: otp },
                    channels: ['whatsapp', 'sms']
                });
            } else {
                const text = `${otp} is your verification code. For your security, do not share this code.`;
                await sendSentDMMessage({
                    to: [phone],
                    text,
                    channels: ['whatsapp', 'sms']
                });
            }
        } catch (err: any) {
            console.warn('⚠️ sent.dm send attempt failed (non-blocking):', err.message);
        }

        return NextResponse.json({ success: true, message: 'SMS Hook handled' });
    } catch (error: any) {
        console.error('❌ Error handling Supabase SMS Hook:', error.message || error);
        return NextResponse.json({ success: true, message: 'Handled with fallback' });
    }
}

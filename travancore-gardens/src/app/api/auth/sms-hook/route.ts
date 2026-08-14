import { NextResponse } from 'next/server';
import { sendSentDMMessage } from '@/lib/sentdm';

export async function POST(req: Request) {
    try {
        const payload = await req.json();
        console.log('📬 Received Supabase SMS Hook request:', JSON.stringify(payload, null, 2));

        const phone = payload?.user?.phone;
        const otp = payload?.sms?.otp;

        if (!phone || !otp) {
            console.error('❌ Supabase SMS Hook request missing phone or otp in payload:', payload);
            return NextResponse.json({ error: 'Missing phone or otp' }, { status: 400 });
        }

        // Send via sent.dm (which supports both WhatsApp and SMS channels)
        const templateId = process.env.SENTDM_OTP_TEMPLATE_ID;
        
        if (templateId) {
            await sendSentDMMessage({
                to: [phone],
                templateId,
                templateParameters: {
                    // Adjust this parameter key ('code', 'otp', etc.) to match what your template expects
                    code: otp
                },
                channels: ['whatsapp', 'sms']
            });
        } else {
            // Fallback to free text if no template ID is configured
            const text = `${otp} is your verification code. For your security, do not share this code.`;
            await sendSentDMMessage({
                to: [phone],
                text,
                channels: ['whatsapp', 'sms']
            });
        }

        return NextResponse.json({ success: true, message: 'OTP sent successfully' });
    } catch (error: any) {
        console.error('❌ Error handling Supabase SMS Hook:', error.message || error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

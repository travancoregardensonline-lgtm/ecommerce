import axios from 'axios';

const SENTDM_BASE_URL = 'https://api.sent.dm/v3';

export interface SendMessagePayload {
    to: string[];
    channels?: string[];
    text?: string;
    templateId?: string;
    templateParameters?: Record<string, string>;
}

/**
 * Sends a message via the sent.dm API (WhatsApp/SMS).
 * @param payload The message payload containing recipient(s) and content.
 */
export async function sendSentDMMessage(payload: SendMessagePayload): Promise<any> {
    const apiKey = process.env.SENTDM_API_KEY;
    if (!apiKey) {
        console.warn('⚠️ sent.dm API key is not configured. Message was not sent.');
        return null;
    }

    const { to, channels = ['whatsapp', 'sms'], text, templateId, templateParameters } = payload;

    // Standardize phone format (ensure + prefix, fallback to India +91 if missing)
    const formattedNumbers = to.map(num => {
        const cleaned = num.trim().replace(/\s+/g, '');
        if (cleaned.startsWith('+')) return cleaned;
        if (cleaned.length === 10) return `+91${cleaned}`;
        return cleaned;
    });

    const body: any = {
        to: formattedNumbers,
        channel: channels,
    };

    if (templateId) {
        body.template = {
            id: templateId,
            parameters: templateParameters || {}
        };
    } else if (text) {
        body.text = text;
    } else {
        throw new Error('You must provide either text or templateId');
    }

    try {
        const response = await axios.post(
            `${SENTDM_BASE_URL}/messages`,
            body,
            {
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'Idempotency-Key': `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
                }
            }
        );
        console.log(`✅ Message successfully sent via sent.dm to ${formattedNumbers.join(', ')}`);
        return response.data;
    } catch (error: any) {
        const errorMsg = error.response?.data?.message || error.message || String(error);
        console.error('❌ Failed to send message via sent.dm:', errorMsg);
        if (error.response?.data) {
            console.error('📦 Detailed error body:', JSON.stringify(error.response.data));
        }
        throw new Error(`sent.dm failed: ${errorMsg}`);
    }
}

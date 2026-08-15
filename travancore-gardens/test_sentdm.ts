import { sendSentDMMessage } from './src/lib/sentdm';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
    try {
        console.log("Testing sent.dm...");
        const result = await sendSentDMMessage({
            to: ['+919876543210'], // Just a dummy number to see if it reaches the API correctly
            text: 'Test OTP 123456',
            channels: ['sms']
        });
        console.log("Success:", result);
    } catch (e: any) {
        console.error("Caught error:", e.message);
    }
}
test();

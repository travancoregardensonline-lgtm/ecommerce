import { createClient } from "@/lib/supabase/client";

/**
 * Supabase Auth helpers for use in Client Components.
 */

export const authActions = {
    /**
     * Send OTP to phone number (Indian format: +91XXXXXXXXXX)
     */
    async sendPhoneOTP(phone: string): Promise<{ error: Error | null }> {
        const supabase = createClient();
        const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;

        const { error } = await supabase.auth.signInWithOtp({
            phone: formattedPhone,
        });

        return { error: error as Error | null };
    },

    /**
     * Verify the phone OTP and sign in.
     */
    async verifyPhoneOTP(phone: string, token: string): Promise<{ error: Error | null }> {
        const supabase = createClient();
        const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;

        const { error } = await supabase.auth.verifyOtp({
            phone: formattedPhone,
            token,
            type: "sms",
        });

        return { error: error as Error | null };
    },

    /**
     * Send OTP to email address (no third-party SMS provider needed).
     */
    async sendEmailOTP(email: string): Promise<{ error: Error | null }> {
        const supabase = createClient();

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: true,
            },
        });

        return { error: error as Error | null };
    },

    /**
     * Verify the email OTP token and sign in.
     */
    async verifyEmailOTP(email: string, token: string): Promise<{ error: Error | null }> {
        const supabase = createClient();

        const { error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: "email",
        });

        return { error: error as Error | null };
    },

    /**
     * Sign out the current user and clear session.
     */
    async signOut(): Promise<void> {
        const supabase = createClient();
        await supabase.auth.signOut();
    },

    /**
     * Get the currently authenticated user.
     */
    async getCurrentUser() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    // Keep old names as aliases for backward compatibility
    async sendOTP(phone: string) { return this.sendPhoneOTP(phone); },
    async verifyOTP(phone: string, token: string) { return this.verifyPhoneOTP(phone, token); },
};

/**
 * Create a user profile row on first sign-in.
 */
export async function ensureProfile(userId: string, identifier: string): Promise<void> {
    const supabase = createClient();

    const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();

    if (!existing) {
        const isEmail = identifier.includes("@");
        await supabase.from("profiles").insert({
            id: userId,
            ...(isEmail ? {} : { phone: identifier }),
        });
    }
}


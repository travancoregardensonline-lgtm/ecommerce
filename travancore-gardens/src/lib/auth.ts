import { createClient } from "@/lib/supabase/client";

/**
 * Supabase Auth helpers for use in Client Components.
 */

export const authActions = {
    /**
     * Sign in with Email and Password.
     */
    async signInWithPassword(email: string, password: string): Promise<{ data: any; error: Error | null }> {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
        });

        return { data, error: error as Error | null };
    },

    /**
     * Sign up with Email, Password, and Full Name.
     */
    async signUp(email: string, password: string, name?: string): Promise<{ data: any; error: Error | null }> {
        const supabase = createClient();
        const cleanEmail = email.trim().toLowerCase();

        const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
                data: {
                    full_name: name?.trim() || "",
                    name: name?.trim() || "",
                },
            },
        });

        if (!error && data.user) {
            await ensureProfile(data.user.id, cleanEmail, name?.trim());
        }

        return { data, error: error as Error | null };
    },

    /**
     * Send password reset email.
     */
    async resetPassword(email: string): Promise<{ error: Error | null }> {
        const supabase = createClient();
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
            redirectTo: typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined,
        });
        return { error: error as Error | null };
    },

    /**
     * Sign in with Google OAuth (1-click login).
     */
    async signInWithGoogle(): Promise<{ error: Error | null }> {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: typeof window !== "undefined" ? `${window.location.origin}/api/auth/callback` : undefined,
            },
        });
        return { error: error as Error | null };
    },

    /**
     * Send OTP to email address (native Supabase email, no SMS provider needed).
     */
    async sendEmailOTP(email: string): Promise<{ error: Error | null }> {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOtp({
            email: email.trim().toLowerCase(),
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
            email: email.trim().toLowerCase(),
            token: token.trim(),
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

    // Retained for backwards compatibility if needed
    async sendPhoneOTP(phone: string): Promise<{ error: Error | null }> {
        const supabase = createClient();
        const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
        const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
        return { error: error as Error | null };
    },

    async verifyPhoneOTP(phone: string, token: string): Promise<{ error: Error | null }> {
        const supabase = createClient();
        const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
        const { error } = await supabase.auth.verifyOtp({ phone: formattedPhone, token, type: "sms" });
        return { error: error as Error | null };
    },
    async sendOTP(phone: string) { return this.sendPhoneOTP(phone); },
    async verifyOTP(phone: string, token: string) { return this.verifyPhoneOTP(phone, token); },
};

/**
 * Create a user profile row on first sign-in.
 */
export async function ensureProfile(userId: string, identifier: string, name?: string): Promise<void> {
    const supabase = createClient();

    const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

    if (!existing) {
        const isEmail = identifier.includes("@");
        await supabase.from("profiles").insert({
            id: userId,
            ...(isEmail ? { email: identifier } : { phone: identifier }),
            ...(name ? { name, full_name: name } : {}),
            role: "customer",
        });
    }
}

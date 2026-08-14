"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ShieldCheck, Leaf, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const supabase = createClient();

            // 1. Sign in with email + password
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

            if (authError) {
                setError("Invalid email or password. Please try again.");
                return;
            }

            // 2. Check that this user has role = 'admin' in profiles
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("role, name")
                .eq("id", authData.user!.id)
                .maybeSingle();

            if (profileError || !profile) {
                await supabase.auth.signOut();
                setError("Account not found. Please contact support.");
                return;
            }

            if (profile.role !== "admin" && profile.role !== "manager" && profile.role !== "super_admin") {
                await supabase.auth.signOut();
                setError("Access denied. You do not have admin privileges.");
                return;
            }

            // 3. Success — redirect to admin dashboard
            router.push("/admin/dashboard");
            router.refresh();

        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1a3d28] via-[#2E5E3E] to-[#1a3d28] flex items-center justify-center p-4">
            {/* Background decorative circles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4 border border-white/20">
                        <Leaf className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Travancore Gardens</h1>
                    <p className="text-white/60 text-sm mt-1">Admin Portal</p>
                </div>

                {/* Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
                            <ShieldCheck className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-lg">Admin Sign In</h2>
                            <p className="text-white/50 text-xs">Restricted access — authorised personnel only</p>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-start gap-2.5 bg-red-500/20 border border-red-500/30 text-red-200 rounded-xl p-3.5 mb-5 text-sm">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-white/70 text-sm font-medium">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                                required
                                autoComplete="email"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all text-sm"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-white/70 text-sm font-medium">Password</label>
                            <div className="relative">
                                <input
                                    type={showPw ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                                >
                                    {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || !email || !password}
                            className="w-full bg-white text-[#2E5E3E] font-bold py-3 rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 text-sm"
                        >
                            {loading ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
                            ) : (
                                <><ShieldCheck className="h-4 w-4" /> Sign In to Admin Panel</>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="mt-6 pt-5 border-t border-white/10 text-center">
                        <p className="text-white/40 text-xs">
                            Not an admin?{" "}
                            <a href="/" className="text-white/70 hover:text-white underline transition-colors">
                                Go to store
                            </a>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-white/30 text-xs mt-6">
                    © {new Date().getFullYear()} Travancore Gardens. All rights reserved.
                </p>
            </div>
        </div>
    );
}

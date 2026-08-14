"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, Phone, Mail, ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { authActions, ensureProfile } from "@/lib/auth";
import { cn } from "@/lib/utils";

type LoginMethod = "email" | "phone";
type Step = "input" | "otp";

export default function LoginPage() {
    const router = useRouter();
    const [method, setMethod] = useState<LoginMethod>("email");
    const [step, setStep] = useState<Step>("input");

    // form values
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // ── Send OTP ───────────────────────────────────────────────────────────────
    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        const result =
            method === "email"
                ? await authActions.sendEmailOTP(email)
                : await authActions.sendPhoneOTP(phone);

        setIsLoading(false);

        if (result.error) {
            setError(result.error.message ?? "Failed to send OTP. Please try again.");
            return;
        }

        setSuccess(
            method === "email"
                ? `A 6-digit code was sent to ${email}`
                : `A 6-digit SMS was sent to +91 ${phone}`
        );
        setStep("otp");
    };

    // ── Verify OTP ────────────────────────────────────────────────────────────
    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const token = otp.join("");
        if (token.length !== 6) {
            setError("Please enter all 6 digits of your OTP.");
            setIsLoading(false);
            return;
        }

        const result =
            method === "email"
                ? await authActions.verifyEmailOTP(email, token)
                : await authActions.verifyPhoneOTP(phone, token);

        if (result.error) {
            setIsLoading(false);
            setError("Invalid or expired OTP. Please try again.");
            return;
        }

        // Ensure profile exists
        const user = await authActions.getCurrentUser();
        if (user) {
            await ensureProfile(user.id, method === "email" ? email : phone);
        }

        router.push("/");
        router.refresh();
    };

    // ── Resend OTP ────────────────────────────────────────────────────────────
    const handleResend = async () => {
        setError(null);
        setOtp(["", "", "", "", "", ""]);
        const result =
            method === "email"
                ? await authActions.sendEmailOTP(email)
                : await authActions.sendPhoneOTP(phone);

        if (result.error) {
            setError("Failed to resend OTP.");
        } else {
            setSuccess("A new OTP has been sent!");
        }
    };

    // ── OTP Input helpers ─────────────────────────────────────────────────────
    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const next = [...otp];
        next[index] = value;
        setOtp(next);
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
        // Auto-submit when all 6 filled
        if (index === 5 && value && next.every(Boolean)) {
            document.getElementById("otp-submit")?.click();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    // ── Method switch ─────────────────────────────────────────────────────────
    const switchMethod = (m: LoginMethod) => {
        setMethod(m);
        setStep("input");
        setError(null);
        setSuccess(null);
        setOtp(["", "", "", "", "", ""]);
    };

    const inputLabel = method === "email" ? email : `+91 ${phone}`;

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* ── Left branding panel ─────────────────────────────────────────── */}
            <div className="hidden lg:flex flex-col justify-between bg-primary p-12 text-white relative overflow-hidden">
                <div
                    className="absolute inset-0 opacity-20 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1466692476878-424526bf1639?auto=format&fit=crop&q=80&w=1400')",
                    }}
                />
                {/* Logo */}
                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2 text-white">
                        <Leaf className="h-7 w-7" />
                        <span className="text-2xl font-bold font-heading">Travancore Gardens</span>
                    </Link>
                </div>

                {/* Tagline */}
                <div className="relative z-10 space-y-4">
                    <h2 className="text-4xl font-bold font-heading leading-tight">
                        Bring the beauty of nature into your home.
                    </h2>
                    <p className="text-white/70 text-lg">
                        Sign in to shop premium plants, track orders, and manage your wishlist.
                    </p>
                </div>

                {/* Trust badge */}
                <div className="relative z-10 flex items-center gap-2 text-white/60 text-sm">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    Secure OTP login. No password needed.
                </div>
            </div>

            {/* ── Right form panel ──────────────────────────────────────────────── */}
            <div className="flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8">

                    {/* Mobile logo */}
                    <div className="text-center lg:hidden">
                        <Link href="/" className="inline-flex items-center gap-2 text-primary mb-6">
                            <Leaf className="h-6 w-6" />
                            <span className="text-xl font-bold font-heading">Travancore Gardens</span>
                        </Link>
                    </div>

                    {/* Heading */}
                    <div className="text-center">
                        <h1 className="text-3xl font-bold font-heading text-foreground">
                            {step === "input" ? "Sign in" : "Enter OTP"}
                        </h1>
                        <p className="mt-2 text-muted-foreground text-sm">
                            {step === "input"
                                ? "Choose how you'd like to receive your one-time password"
                                : `We sent a 6-digit code to ${inputLabel}`}
                        </p>
                    </div>

                    {/* ── Method tabs (only visible on step=input) ─────────────────── */}
                    {step === "input" && (
                        <div className="flex rounded-xl border border-border overflow-hidden">
                            {(["email", "phone"] as const).map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => switchMethod(m)}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
                                        method === m
                                            ? "bg-primary text-white"
                                            : "bg-card text-muted-foreground hover:bg-muted"
                                    )}
                                >
                                    {m === "email" ? (
                                        <><Mail className="h-4 w-4" /> Email OTP</>
                                    ) : (
                                        <><Phone className="h-4 w-4" /> Mobile OTP</>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ── Alerts ────────────────────────────────────────────────────── */}
                    {error && (
                        <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-xl px-4 py-3">
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-400 text-sm rounded-xl px-4 py-3">
                            <span>{success}</span>
                        </div>
                    )}

                    {/* ── Step 1: Enter email or phone ─────────────────────────────── */}
                    {step === "input" && (
                        <form onSubmit={handleSendOTP} className="space-y-5">
                            {method === "email" ? (
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="email"
                                        required
                                        className="h-12"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Mobile Number</Label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-4 border border-r-0 rounded-l-md bg-muted text-muted-foreground text-sm font-medium border-input h-12">
                                            +91
                                        </span>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="98765 43210"
                                            value={phone}
                                            onChange={(e) =>
                                                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                                            }
                                            className="rounded-l-none h-12"
                                            maxLength={10}
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full h-12 text-base"
                                disabled={
                                    isLoading ||
                                    (method === "email" ? !email : phone.length !== 10)
                                }
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : method === "email" ? (
                                    <Mail className="mr-2 h-4 w-4" />
                                ) : (
                                    <Phone className="mr-2 h-4 w-4" />
                                )}
                                {isLoading ? "Sending OTP…" : "Send OTP"}
                            </Button>

                            <p className="text-center text-xs text-muted-foreground leading-relaxed">
                                By continuing you agree to our{" "}
                                <Link href="/terms" className="text-primary hover:underline">Terms</Link>{" "}
                                &amp;{" "}
                                <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                            </p>
                        </form>
                    )}

                    {/* ── Step 2: Enter OTP ─────────────────────────────────────────── */}
                    {step === "otp" && (
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-center block">6-Digit OTP</Label>
                                <div className="flex gap-2 justify-center">
                                    {otp.map((digit, i) => (
                                        <input
                                            key={i}
                                            id={`otp-${i}`}
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(i, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                            className={cn(
                                                "h-14 w-11 text-center text-2xl font-bold border rounded-xl bg-background",
                                                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                                                "transition-all",
                                                digit ? "border-primary" : "border-input"
                                            )}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-center text-muted-foreground">
                                    {method === "email"
                                        ? "Check your inbox (and spam folder)"
                                        : "Check your SMS messages"}
                                </p>
                            </div>

                            <Button
                                id="otp-submit"
                                type="submit"
                                size="lg"
                                className="w-full h-12 text-base"
                                disabled={isLoading}
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isLoading ? "Verifying…" : "Verify & Sign In"}
                            </Button>

                            <div className="flex items-center justify-between text-sm">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep("input");
                                        setError(null);
                                        setSuccess(null);
                                        setOtp(["", "", "", "", "", ""]);
                                    }}
                                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    {method === "email" ? "Change email" : "Change number"}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleResend}
                                    className="text-primary hover:underline font-medium"
                                >
                                    Resend OTP
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

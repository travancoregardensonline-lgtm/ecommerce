"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Leaf,
    Mail,
    Lock,
    User,
    Eye,
    EyeOff,
    Loader2,
    ArrowLeft,
    CheckCircle2,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { authActions } from "@/lib/auth";
import { cn } from "@/lib/utils";

type AuthMode = "signin" | "signup" | "magic-link" | "forgot";

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get("redirect") || "/";

    const [mode, setMode] = useState<AuthMode>("signin");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Email OTP states (for passwordless tab)
    const [otpStep, setOtpStep] = useState<"input" | "verify">("input");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // ── Handle Email + Password Sign In ──────────────────────────────────────────
    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        const { error } = await authActions.signInWithPassword(email, password);
        setIsLoading(false);

        if (error) {
            setError(error.message || "Invalid email or password.");
            return;
        }

        router.push(redirectUrl);
        router.refresh();
    };

    // ── Handle Account Registration ─────────────────────────────────────────────
    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            setIsLoading(false);
            return;
        }

        const { error } = await authActions.signUp(email, password, name);
        setIsLoading(false);

        if (error) {
            setError(error.message || "Failed to create account. Please try again.");
            return;
        }

        setSuccess("Account created successfully! Redirecting...");
        setTimeout(() => {
            router.push(redirectUrl);
            router.refresh();
        }, 1200);
    };

    // ── Handle Forgot Password ──────────────────────────────────────────────────
    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError("Please enter your email address.");
            return;
        }

        setIsLoading(true);
        setError(null);
        const { error } = await authActions.resetPassword(email);
        setIsLoading(false);

        if (error) {
            setError(error.message || "Could not send password reset email.");
        } else {
            setSuccess(`Password reset link sent to ${email}. Please check your inbox.`);
        }
    };

    // ── Handle Passwordless Email OTP ───────────────────────────────────────────
    const handleSendEmailOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        setError(null);
        const { error } = await authActions.sendEmailOTP(email);
        setIsLoading(false);

        if (error) {
            setError(error.message || "Failed to send verification code.");
        } else {
            setSuccess(`A 6-digit verification code was sent to ${email}`);
            setOtpStep("verify");
        }
    };

    const handleVerifyEmailOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = otp.join("");
        if (token.length !== 6) {
            setError("Please enter all 6 digits of your code.");
            return;
        }

        setIsLoading(true);
        setError(null);
        const { error } = await authActions.verifyEmailOTP(email, token);
        setIsLoading(false);

        if (error) {
            setError("Invalid or expired code. Please try again.");
            return;
        }

        router.push(redirectUrl);
        router.refresh();
    };

    // ── Handle Google OAuth ─────────────────────────────────────────────────────
    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError(null);
        const { error } = await authActions.signInWithGoogle();
        if (error) {
            setIsLoading(false);
            setError(error.message || "Failed to initialize Google login.");
        }
    };

    // ── OTP input helpers ───────────────────────────────────────────────────────
    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const next = [...otp];
        next[index] = value;
        setOtp(next);
        if (value && index < 5) {
            document.getElementById(`login-otp-${index + 1}`)?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            document.getElementById(`login-otp-${index - 1}`)?.focus();
        }
    };

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
                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2.5 text-white group">
                        <Image
                            src="/logo.png"
                            alt="Travancore Gardens Logo"
                            width={40}
                            height={40}
                            className="h-10 w-10 object-contain drop-shadow-md group-hover:scale-105 transition-transform"
                        />
                        <span className="text-2xl font-bold font-heading">Travancore Gardens</span>
                    </Link>
                </div>

                <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-green-200">
                        <Sparkles className="h-3.5 w-3.5" /> Easy &amp; Fast Shopping
                    </div>
                    <h2 className="text-4xl font-bold font-heading leading-tight">
                        Bring the fresh beauty of nature into your home.
                    </h2>
                    <p className="text-white/70 text-lg">
                        Sign in to track orders, save shipping addresses, and manage your wishlist anytime.
                    </p>
                </div>

                <div className="relative z-10 flex items-center justify-between text-white/60 text-sm">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 shrink-0" />
                        Secure Supabase Authentication
                    </div>
                    <Link href="/" className="hover:text-white underline text-xs">
                        Continue as Guest →
                    </Link>
                </div>
            </div>

            {/* ── Right form panel ──────────────────────────────────────────────── */}
            <div className="flex items-center justify-center p-6 sm:p-12 bg-background">
                <div className="w-full max-w-md space-y-6">
                    {/* Mobile Logo */}
                    <div className="text-center lg:hidden">
                        <Link href="/" className="inline-flex items-center gap-2 text-primary mb-2">
                            <Image
                                src="/logo.png"
                                alt="Travancore Gardens Logo"
                                width={32}
                                height={32}
                                className="h-8 w-8 object-contain"
                            />
                            <span className="text-xl font-bold font-heading">Travancore Gardens</span>
                        </Link>
                    </div>

                    {/* Mode Headers */}
                    <div className="text-center">
                        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground">
                            {mode === "signin" && "Welcome Back"}
                            {mode === "signup" && "Create an Account"}
                            {mode === "magic-link" && "Passwordless Sign In"}
                            {mode === "forgot" && "Reset Password"}
                        </h1>
                        <p className="mt-1.5 text-muted-foreground text-sm">
                            {mode === "signin" && "Sign in with your email and password"}
                            {mode === "signup" && "Join us for quick order tracking & saved addresses"}
                            {mode === "magic-link" && "Receive a quick verification code in your email"}
                            {mode === "forgot" && "Enter your email to receive a recovery link"}
                        </p>
                    </div>

                    {/* Tabs between Sign In and Sign Up */}
                    {(mode === "signin" || mode === "signup") && (
                        <div className="flex rounded-xl border border-border p-1 bg-muted/40">
                            <button
                                type="button"
                                onClick={() => {
                                    setMode("signin");
                                    setError(null);
                                    setSuccess(null);
                                }}
                                className={cn(
                                    "flex-1 py-2 text-sm font-semibold rounded-lg transition-all",
                                    mode === "signin"
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Sign In
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setMode("signup");
                                    setError(null);
                                    setSuccess(null);
                                }}
                                className={cn(
                                    "flex-1 py-2 text-sm font-semibold rounded-lg transition-all",
                                    mode === "signup"
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Create Account
                            </button>
                        </div>
                    )}

                    {/* Alerts */}
                    {error && (
                        <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-xl px-4 py-3">
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-400 text-sm rounded-xl px-4 py-3">
                            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>{success}</span>
                        </div>
                    )}

                    {/* ── Mode 1: Sign In (Email + Password) ───────────────────────── */}
                    {mode === "signin" && (
                        <form onSubmit={handleSignIn} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 h-11"
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMode("forgot");
                                            setError(null);
                                            setSuccess(null);
                                        }}
                                        className="text-xs text-primary hover:underline font-medium"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10 h-11"
                                        autoComplete="current-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button type="submit" size="lg" className="w-full h-11 font-semibold" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isLoading ? "Signing in…" : "Sign In"}
                            </Button>
                        </form>
                    )}

                    {/* ── Mode 2: Create Account ──────────────────────────────────── */}
                    {mode === "signup" && (
                        <form onSubmit={handleSignUp} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="signup-name">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="signup-name"
                                        type="text"
                                        placeholder="Your Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="pl-10 h-11"
                                        autoComplete="name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="signup-email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="signup-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 h-11"
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="signup-password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="signup-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="At least 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10 h-11"
                                        autoComplete="new-password"
                                        minLength={6}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button type="submit" size="lg" className="w-full h-11 font-semibold" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isLoading ? "Creating account…" : "Create Account"}
                            </Button>
                        </form>
                    )}

                    {/* ── Mode 3: Forgot Password ─────────────────────────────────── */}
                    {mode === "forgot" && (
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="forgot-email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="forgot-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 h-11"
                                        required
                                    />
                                </div>
                            </div>

                            <Button type="submit" size="lg" className="w-full h-11 font-semibold" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isLoading ? "Sending link…" : "Send Reset Link"}
                            </Button>

                            <button
                                type="button"
                                onClick={() => {
                                    setMode("signin");
                                    setError(null);
                                    setSuccess(null);
                                }}
                                className="w-full flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground pt-2"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                            </button>
                        </form>
                    )}

                    {/* ── Mode 4: Passwordless Email OTP ──────────────────────────── */}
                    {mode === "magic-link" && (
                        <div>
                            {otpStep === "input" ? (
                                <form onSubmit={handleSendEmailOTP} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="magic-email">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="magic-email"
                                                type="email"
                                                placeholder="you@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="pl-10 h-11"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <Button type="submit" size="lg" className="w-full h-11 font-semibold" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        {isLoading ? "Sending code…" : "Send 6-Digit Code"}
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMode("signin");
                                            setError(null);
                                            setSuccess(null);
                                        }}
                                        className="w-full flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground pt-2"
                                    >
                                        <ArrowLeft className="h-3.5 w-3.5" /> Back to Password Login
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyEmailOTP} className="space-y-5">
                                    <div className="space-y-3">
                                        <Label className="text-center block text-sm">Enter the 6-Digit Code</Label>
                                        <div className="flex gap-2 justify-center">
                                            {otp.map((digit, i) => (
                                                <input
                                                    key={i}
                                                    id={`login-otp-${i}`}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                                    className={cn(
                                                        "h-12 w-11 text-center text-xl font-bold border rounded-xl bg-background",
                                                        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                                                        digit ? "border-primary" : "border-input"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-center text-muted-foreground">Sent to {email}</p>
                                    </div>

                                    <Button type="submit" size="lg" className="w-full h-11 font-semibold" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        {isLoading ? "Verifying…" : "Verify & Sign In"}
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setOtpStep("input");
                                            setOtp(["", "", "", "", "", ""]);
                                            setError(null);
                                        }}
                                        className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        Change email address
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* Secondary Options */}
                    {(mode === "signin" || mode === "signup") && (
                        <div className="space-y-4 pt-2">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-border" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-3 text-muted-foreground font-medium">Or</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setMode("magic-link");
                                    setError(null);
                                    setSuccess(null);
                                }}
                                className="w-full py-2.5 px-4 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors flex items-center justify-center gap-2"
                            >
                                <Mail className="h-4 w-4 text-primary" />
                                Sign in with Email Code (No password)
                            </button>

                            {/* Continue as Guest Button */}
                            <div className="pt-2 text-center">
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5" /> Continue browsing as Guest (No login needed)
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            }
        >
            <LoginContent />
        </Suspense>
    );
}

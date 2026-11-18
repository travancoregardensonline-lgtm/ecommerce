"use client";

import Image from "next/image";
import Script from "next/script";
import { useRouter } from "next/navigation";
import {
    CreditCard,
    CheckCircle2,
    Package,
    User,
    ShieldCheck,
    Loader2,
    Tag,
    X,
    Mail,
    Phone,
    MapPin,
    LogIn,
    ShoppingCart,
    ChevronDown,
    ArrowLeft,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cartStore";
import { useMyProfile, useMyAddresses } from "@/hooks/useSupabase";
import { useAuthStore } from "@/store/authStore";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { toast } from "sonner";

export default function CheckoutPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { items, clearCart } = useCartStore();
    const { data: profile } = useMyProfile();
    const { data: addresses } = useMyAddresses();

    const [paymentMethod, setPaymentMethod] = useState<"card" | "upi">("card");
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [isPlacing, setIsPlacing] = useState(false);
    const [orderError, setOrderError] = useState<string | null>(null);

    // Coupon states
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{
        id: string;
        code: string;
        discount_type: string;
        discount_value: number;
        min_order_value: number;
    } | null>(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [showMobileSummary, setShowMobileSummary] = useState(false);

    // Address & Contact Form State
    const [form, setForm] = useState({
        full_name: profile?.name ?? "",
        email: user?.email ?? "",
        phone: profile?.phone ?? "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        pincode: "",
    });

    // Sync profile and user email when loaded
    useEffect(() => {
        if (profile) {
            setForm((prev) => ({
                ...prev,
                full_name: prev.full_name || profile.name || "",
                phone: prev.phone || profile.phone || "",
            }));
        }
        if (user?.email) {
            setForm((prev) => ({
                ...prev,
                email: prev.email || user.email || "",
            }));
        }
    }, [profile, user]);

    // Auto-select default address if user is logged in
    useEffect(() => {
        if (addresses && (addresses as any[]).length > 0 && !selectedAddressId) {
            const def = (addresses as any[]).find((a: any) => a.is_default) || addresses[0];
            if (def) setSelectedAddressId(def.id);
        }
    }, [addresses, selectedAddressId]);

    // Calculations
    const subtotal = items.reduce((s, i) => s + (i.sale_price ?? i.price) * i.quantity, 0);
    const totalWeight = items.reduce((w, i) => w + (Number(i.weight) || 0.5) * i.quantity, 0);
    const shipping = subtotal > 1500 ? 0 : 99;

    let discount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.discount_type === "percentage") {
            discount = (subtotal * appliedCoupon.discount_value) / 100;
        } else {
            discount = appliedCoupon.discount_value;
        }
    }

    const total = Math.max(0, subtotal + shipping - discount);

    // Coupon verification
    const handleApplyCoupon = async (codeToApply?: string) => {
        const targetCode = (codeToApply ?? couponCode).trim().toUpperCase();
        if (!targetCode) return;
        setCouponLoading(true);
        const supabase = createClient();

        try {
            const { data: coupon, error } = await supabase
                .from("coupons")
                .select("*")
                .eq("code", targetCode)
                .eq("is_active", true)
                .maybeSingle();

            if (error || !coupon) {
                toast.error("Invalid or expired coupon code.");
                setAppliedCoupon(null);
                return;
            }

            if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
                toast.error("This coupon has expired.");
                setAppliedCoupon(null);
                return;
            }

            if (coupon.min_order_value && subtotal < coupon.min_order_value) {
                toast.error(`Minimum order value for this coupon is ₹${coupon.min_order_value}`);
                setAppliedCoupon(null);
                return;
            }

            if (coupon.max_uses && coupon.usage_count >= coupon.max_uses) {
                toast.error("This coupon has reached its maximum usage limit.");
                setAppliedCoupon(null);
                return;
            }

            setAppliedCoupon(coupon);
            toast.success("Coupon applied successfully!");
            setCouponCode("");
        } catch {
            toast.error("Failed to verify coupon.");
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        toast.info("Coupon removed.");
    };

    // ── Handle Place Order (Guest + Logged in) ───────────────────────────────────
    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setOrderError(null);

        if (!items.length) {
            toast.error("Your cart is empty.");
            return;
        }

        // Validate shipping details
        const isUsingSavedAddress = user && addresses && (addresses as any[]).length > 0 && selectedAddressId;

        if (!isUsingSavedAddress) {
            if (!form.full_name?.trim()) {
                setOrderError("Please enter your full name.");
                toast.error("Please enter your full name.");
                return;
            }
            if (!form.phone || form.phone.replace(/\D/g, "").length < 10) {
                setOrderError("Please enter a valid 10-digit mobile number for delivery.");
                toast.error("Please enter a valid 10-digit mobile number.");
                return;
            }
            if (!user && !form.email?.includes("@")) {
                setOrderError("Please enter a valid email address.");
                toast.error("Please enter a valid email address.");
                return;
            }
            if (!form.address_line1?.trim()) {
                setOrderError("Please enter your delivery street address.");
                toast.error("Please enter your street address.");
                return;
            }
            if (!form.city?.trim()) {
                setOrderError("Please enter your city.");
                toast.error("Please enter your city.");
                return;
            }
            if (!form.state?.trim()) {
                setOrderError("Please enter your state.");
                toast.error("Please enter your state.");
                return;
            }
            if (!form.pincode || form.pincode.replace(/\D/g, "").length !== 6) {
                setOrderError("Please enter a valid 6-digit postal pincode.");
                toast.error("Please enter a valid 6-digit postal pincode.");
                return;
            }
        }

        setIsPlacing(true);

        try {
            // Prepare Order Payload for API (Address is resolved safely on the server using Admin client)
            const orderPayload: any = {
                user_id: user?.id || null,
                address_id: isUsingSavedAddress ? selectedAddressId : undefined,
                address: !isUsingSavedAddress
                    ? {
                          full_name: form.full_name.trim(),
                          phone: form.phone.trim(),
                          email: user?.email || form.email.trim(),
                          address_line1: form.address_line1.trim(),
                          address_line2: form.address_line2.trim() || null,
                          city: form.city.trim(),
                          state: form.state.trim(),
                          pincode: form.pincode.trim(),
                          country: "India",
                      }
                    : undefined,
                total_amount: total,
                shipping_cost: shipping,
                discount_amount: discount,
                coupon_code: appliedCoupon?.code || null,
                payment_method: paymentMethod,
                payment_status: "pending",
                order_status: "pending",
                weight: totalWeight,
                customer_details: {
                    full_name: form.full_name || profile?.name || "Customer",
                    email: user?.email || form.email || "travancoregardensonline@gmail.com",
                    phone: form.phone || profile?.phone || "",
                },
                items: items.map((i) => ({
                    product_id: i.product_id,
                    quantity: i.quantity,
                    price: i.sale_price ?? i.price,
                    weight: Number(i.weight) || 0.5,
                })),
            };

            const orderRes = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderPayload),
            });

            const orderData = await orderRes.json();

            if (!orderRes.ok) {
                throw new Error(orderData.error || "Failed to create order. Please try again.");
            }

            const createdOrder = orderData.order;

            // Online Payment (Razorpay)
            const rzpRes = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: total, receipt: createdOrder.id }),
            });

            const rzpOrder = await rzpRes.json();

            if (!rzpRes.ok) {
                throw new Error(rzpOrder.error || "Failed to initialize payment gateway.");
            }

            const customerName = form.full_name || profile?.name || "Customer";
            const customerEmail = user?.email || form.email || "travancoregardensonline@gmail.com";
            const customerPhone = form.phone || profile?.phone || "";

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
                amount: rzpOrder.amount,
                currency: rzpOrder.currency,
                name: "Travancore Gardens",
                description: "Plant Order Checkout",
                image: "/logo.png",
                order_id: rzpOrder.id,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await fetch("/api/verify-payment", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                supabase_order_id: createdOrder.id,
                            }),
                        });

                        const verifyData = await verifyRes.json();
                        if (verifyData.success) {
                            clearCart();
                            toast.success("Payment successful!");
                            router.push(`/order-success?order=${createdOrder.id}`);
                        } else {
                            setOrderError(verifyData.error || "Payment verification failed. Please contact support.");
                        }
                    } catch {
                        setOrderError("Verification failed. Please contact support with Order ID #" + createdOrder.id.slice(0, 8));
                    }
                },
                prefill: {
                    name: customerName,
                    email: customerEmail,
                    contact: customerPhone,
                },
                theme: {
                    color: "#2E5E3E",
                },
                modal: {
                    ondismiss: function () {
                        setIsPlacing(false);
                        toast.info("Payment cancelled. You can retry when ready.");
                    },
                },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on("payment.failed", function (response: any) {
                setOrderError(response.error.description || "Payment failed. Please try again.");
                setIsPlacing(false);
            });
            rzp.open();
        } catch (err: any) {
            setOrderError(err.message || "Something went wrong while placing your order.");
            toast.error(err.message || "Failed to initiate payment.");
            setIsPlacing(false);
        }
    };

    if (!items.length) {
        return (
            <div className="container mx-auto px-4 py-20 text-center max-w-md">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold font-heading mb-2">Your cart is empty</h1>
                <p className="text-sm text-muted-foreground mb-6">
                    Explore our curated collection of nursery plants to get started.
                </p>
                <Button asChild size="lg" className="rounded-xl">
                    <Link href="/shop">Browse Plants &rarr;</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-10 pb-28 lg:pb-16 max-w-6xl">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

            {/* Top Navigation & Back Link */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <Link
                    href="/cart"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Cart</span>
                </Link>

                <div className="flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>256-Bit SSL Encrypted</span>
                </div>
            </div>

            {/* Header & Auth State Banner */}
            <div className="max-w-6xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground">
                        Secure Checkout
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        Complete your plant delivery details below
                    </p>
                </div>

                {!user ? (
                    <div className="inline-flex items-center gap-2 p-2 px-3.5 rounded-xl bg-muted/60 border text-xs text-muted-foreground self-start sm:self-auto">
                        <span>Already registered?</span>
                        <Link
                            href="/login?redirect=/checkout"
                            className="text-primary font-bold hover:underline inline-flex items-center gap-1"
                        >
                            <LogIn className="h-3 w-3" /> Log In
                        </Link>
                    </div>
                ) : (
                    <div className="inline-flex items-center gap-2 p-2 px-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 self-start sm:self-auto">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate max-w-[200px] sm:max-w-none">
                            Logged in as <strong>{profile?.name || user.email}</strong>
                        </span>
                    </div>
                )}
            </div>

            {/* Mobile Collapsible Order Summary Accordion */}
            <div className="lg:hidden mb-6 border border-border/80 rounded-2xl bg-card overflow-hidden shadow-sm">
                <button
                    type="button"
                    onClick={() => setShowMobileSummary(!showMobileSummary)}
                    className="w-full flex items-center justify-between p-3.5 text-xs font-semibold text-foreground bg-muted/30 active:bg-muted/50 transition-colors"
                >
                    <span className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-primary" />
                        <span>
                            {showMobileSummary
                                ? "Hide Order Summary"
                                : `Order Summary (${items.length} item${items.length !== 1 ? "s" : ""})`}
                        </span>
                        <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                                showMobileSummary ? "rotate-180" : ""
                            }`}
                        />
                    </span>
                    <span className="text-sm font-black text-primary">₹{total.toLocaleString("en-IN")}</span>
                </button>

                {showMobileSummary && (
                    <div className="p-4 pt-3 border-t border-border/60 space-y-4">
                        {/* Items list */}
                        <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 divide-y divide-border/40">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between gap-3 pt-2.5 first:pt-0 text-xs">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="relative h-11 w-11 rounded-lg overflow-hidden bg-muted border shrink-0">
                                            <Image
                                                src={item.image_url || "/logo.png"}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-foreground truncate">{item.name}</p>
                                            <p className="text-[11px] text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-foreground shrink-0">
                                        ₹{((item.sale_price ?? item.price) * item.quantity).toLocaleString("en-IN")}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Mobile Quick Coupon Input */}
                        <div className="pt-2 border-t border-border/60">
                            {!appliedCoupon ? (
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                        <Input
                                            placeholder="Promo Code"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            className="h-9 text-xs pl-8 bg-muted/20 rounded-xl"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleApplyCoupon()}
                                        disabled={couponLoading || !couponCode}
                                        className="h-9 px-3 rounded-xl text-xs font-semibold"
                                    >
                                        {couponLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Apply"}
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-2.5 bg-primary/10 border border-primary/20 rounded-xl text-xs">
                                    <div className="flex items-center gap-1.5 font-semibold text-primary">
                                        <Tag className="h-3.5 w-3.5" />
                                        <span>{appliedCoupon.code} applied!</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveCoupon}
                                        className="text-muted-foreground hover:text-foreground p-1"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Totals */}
                        <div className="pt-2 border-t border-border/60 space-y-1.5 text-xs text-muted-foreground">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-medium text-foreground">₹{subtotal.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery</span>
                                <span className="font-semibold text-foreground">
                                    {shipping === 0 ? <span className="text-primary font-bold">FREE</span> : `₹${shipping}`}
                                </span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-emerald-600 font-semibold">
                                    <span>Discount</span>
                                    <span>-₹{discount.toLocaleString("en-IN")}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handlePlaceOrder}>
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 max-w-6xl mx-auto">
                    {/* Left: Shipping & Payment Details */}
                    <div className="flex-1 space-y-6 sm:space-y-8">
                        {/* 1. Contact Information */}
                        <section className="bg-card border border-border/70 rounded-2xl p-4 sm:p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <User className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg font-bold text-foreground">
                                        1. Contact Information
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        We&apos;ll send order tracking and courier updates here
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label htmlFor="checkout-name" className="text-xs font-semibold">Full Name *</Label>
                                    <Input
                                        id="checkout-name"
                                        value={form.full_name || profile?.name || ""}
                                        onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                                        placeholder="E.g. Rahul Sharma"
                                        autoComplete="name"
                                        className="h-11 rounded-xl text-sm"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="checkout-email" className="text-xs font-semibold">Email Address *</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="checkout-email"
                                            type="email"
                                            inputMode="email"
                                            autoComplete="email"
                                            value={user?.email || form.email}
                                            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                            readOnly={!!user}
                                            className={`h-11 rounded-xl text-sm pl-9 ${user ? "bg-muted/50" : ""}`}
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </div>
                                    {user && <span className="text-[10px] text-muted-foreground">Connected to account</span>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="checkout-phone" className="text-xs font-semibold">Mobile Number (Courier Contact) *</Label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 border border-r-0 rounded-l-xl bg-muted/60 text-muted-foreground text-xs font-semibold">
                                            +91
                                        </span>
                                        <Input
                                            id="checkout-phone"
                                            type="tel"
                                            inputMode="tel"
                                            autoComplete="tel"
                                            value={form.phone}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                                                }))
                                            }
                                            placeholder="98765 43210"
                                            className="h-11 rounded-l-none rounded-r-xl text-sm"
                                            maxLength={10}
                                            required
                                        />
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">Courier delivery agent will call this number</span>
                                </div>
                            </div>
                        </section>

                        {/* 2. Shipping Address */}
                        <section className="bg-card border border-border/70 rounded-2xl p-4 sm:p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <MapPin className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg font-bold text-foreground">
                                        2. Shipping Address
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Where should our Kerala nursery deliver your plants?
                                    </p>
                                </div>
                            </div>

                            {/* Saved Addresses for Logged-In Users */}
                            {user && addresses && (addresses as any[]).length > 0 ? (
                                <div className="space-y-3 mb-4">
                                    <p className="text-xs font-semibold text-muted-foreground">Saved Addresses</p>
                                    <div className="space-y-2.5">
                                        {(addresses as any[]).map((addr: any) => (
                                            <label
                                                key={addr.id}
                                                className={`flex items-start gap-3 p-3 sm:p-4 border rounded-xl cursor-pointer transition-colors ${
                                                    selectedAddressId === addr.id
                                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                        : "hover:border-primary/40 bg-card"
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="address"
                                                    className="mt-1 h-4 w-4 accent-primary"
                                                    checked={selectedAddressId === addr.id}
                                                    onChange={() => setSelectedAddressId(addr.id)}
                                                />
                                                <div className="text-xs sm:text-sm min-w-0">
                                                    <p className="font-semibold text-foreground">
                                                        {addr.full_name}{" "}
                                                        {addr.is_default && (
                                                            <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full ml-1">
                                                                Default
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-muted-foreground mt-0.5 line-clamp-2">
                                                        {addr.address_line1}
                                                        {addr.address_line2 ? `, ${addr.address_line2}` : ""},{" "}
                                                        {addr.city}, {addr.state} — {addr.pincode}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                                                        <Phone className="h-3 w-3" /> {addr.phone}
                                                    </p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>

                                    <div className="pt-1">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedAddressId(null)}
                                            className={`text-xs font-semibold ${
                                                !selectedAddressId
                                                    ? "text-primary underline"
                                                    : "text-muted-foreground hover:text-foreground"
                                            }`}
                                        >
                                            + Deliver to a different address
                                        </button>
                                    </div>
                                </div>
                            ) : null}

                            {/* Manual Address Input Form */}
                            {(!user || !addresses || (addresses as any[]).length === 0 || !selectedAddressId) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                                    <div className="space-y-1.5 md:col-span-2">
                                        <Label htmlFor="address-1" className="text-xs font-semibold">
                                            House / Flat / Building No. &amp; Street *
                                        </Label>
                                        <Input
                                            id="address-1"
                                            value={form.address_line1}
                                            onChange={(e) => setForm((f) => ({ ...f, address_line1: e.target.value }))}
                                            placeholder="E.g. Flat 402, Green Meadows, MG Road"
                                            autoComplete="street-address"
                                            className="h-11 rounded-xl text-sm"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5 md:col-span-2">
                                        <Label htmlFor="address-2" className="text-xs font-semibold">
                                            Area / Locality / Landmark (Optional)
                                        </Label>
                                        <Input
                                            id="address-2"
                                            value={form.address_line2}
                                            onChange={(e) => setForm((f) => ({ ...f, address_line2: e.target.value }))}
                                            placeholder="Near Botanical Garden, Opposite Post Office"
                                            autoComplete="address-line2"
                                            className="h-11 rounded-xl text-sm"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="city" className="text-xs font-semibold">City / Town *</Label>
                                        <Input
                                            id="city"
                                            value={form.city}
                                            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                                            placeholder="Kochi / Bangalore / Mumbai"
                                            autoComplete="address-level2"
                                            className="h-11 rounded-xl text-sm"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="state" className="text-xs font-semibold">State *</Label>
                                        <Input
                                            id="state"
                                            value={form.state}
                                            onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                                            placeholder="Kerala / Karnataka / Maharashtra"
                                            autoComplete="address-level1"
                                            className="h-11 rounded-xl text-sm"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="pincode" className="text-xs font-semibold">6-Digit Pincode *</Label>
                                        <Input
                                            id="pincode"
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]{6}"
                                            maxLength={6}
                                            autoComplete="postal-code"
                                            value={form.pincode}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                                                }))
                                            }
                                            placeholder="695572"
                                            className="h-11 rounded-xl text-sm"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="country" className="text-xs font-semibold">Country</Label>
                                        <Input
                                            id="country"
                                            value="India"
                                            readOnly
                                            className="h-11 rounded-xl text-sm bg-muted text-muted-foreground"
                                        />
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* 3. Payment Method */}
                        <section className="bg-card border border-border/70 rounded-2xl p-4 sm:p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <CreditCard className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg font-bold text-foreground">
                                        3. Payment Method
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        100% Encrypted &amp; Protected via Razorpay
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {[
                                    {
                                        id: "card",
                                        title: "Cards & Netbanking (Razorpay)",
                                        desc: "Visa, Mastercard, RuPay, Corporate & Retail Netbanking",
                                    },
                                    {
                                        id: "upi",
                                        title: "UPI (Google Pay, PhonePe, Paytm, QR)",
                                        desc: "Instant zero-fee payment directly from any UPI App",
                                    },
                                ].map((opt) => (
                                    <label
                                        key={opt.id}
                                        className={`flex items-start gap-3 p-3.5 sm:p-4 border rounded-xl cursor-pointer transition-all ${
                                            paymentMethod === opt.id
                                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                : "hover:border-primary/40 bg-card"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            value={opt.id}
                                            checked={paymentMethod === opt.id}
                                            onChange={() => setPaymentMethod(opt.id as any)}
                                            className="mt-1 h-4 w-4 accent-primary"
                                        />
                                        <div>
                                            <span className="font-semibold text-xs sm:text-sm text-foreground block">
                                                {opt.title}
                                            </span>
                                            <span className="text-[11px] sm:text-xs text-muted-foreground">
                                                {opt.desc}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right: Order Summary Sidebar (Desktop sticky & tablet) */}
                    <div className="w-full lg:w-[400px]">
                        <div className="border border-border/70 rounded-2xl p-4 sm:p-6 bg-card sticky top-24 shadow-sm space-y-5">
                            <h2 className="text-lg font-bold text-foreground tracking-tight">
                                Order Summary
                            </h2>

                            {/* Items List */}
                            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 divide-y divide-border/40">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-3 pt-3 first:pt-0">
                                        <div className="h-14 w-14 bg-card rounded-xl shrink-0 border overflow-hidden relative">
                                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-bl-md z-10">
                                                {item.quantity}
                                            </div>
                                            {item.image_url ? (
                                                <Image
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="56px"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                                    <Package className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <p className="font-semibold text-xs text-foreground truncate">{item.name}</p>
                                            <p className="text-[11px] text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="flex items-center font-bold text-xs shrink-0">
                                            ₹{((item.sale_price ?? item.price) * item.quantity).toLocaleString("en-IN")}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Separator />

                            {/* Coupon Code Input */}
                            <div>
                                {!appliedCoupon ? (
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                            <Input
                                                placeholder="Promo Code"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                className="h-10 text-xs pl-8 bg-muted/20 rounded-xl"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleApplyCoupon()}
                                            disabled={couponLoading || !couponCode}
                                            className="h-10 px-3 rounded-xl text-xs font-semibold"
                                        >
                                            {couponLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply"}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-2.5 bg-primary/10 border border-primary/20 rounded-xl text-xs">
                                        <div className="flex items-center gap-2 font-semibold text-primary">
                                            <Tag className="h-4 w-4" />
                                            <span>{appliedCoupon.code} applied!</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveCoupon}
                                            className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-2.5 text-xs text-muted-foreground">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-foreground">
                                        ₹{subtotal.toLocaleString("en-IN")}
                                    </span>
                                </div>

                                {discount > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-semibold">
                                        <span>Coupon Discount</span>
                                        <span>-₹{discount.toLocaleString("en-IN")}</span>
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span className={`font-semibold ${shipping === 0 ? "text-primary font-bold" : "text-foreground"}`}>
                                        {shipping === 0 ? "FREE" : `₹${shipping}`}
                                    </span>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex justify-between items-baseline text-base font-bold text-foreground">
                                <span>Total Amount</span>
                                <span className="text-xl font-black text-primary">
                                    ₹{total.toLocaleString("en-IN")}
                                </span>
                            </div>

                            {orderError && (
                                <div className="p-3 bg-destructive/10 border border-destructive/30 text-destructive text-xs rounded-xl">
                                    {orderError}
                                </div>
                            )}

                            {/* Main CTA button on desktop */}
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full h-12 text-sm font-bold shadow-md rounded-xl active:scale-95 transition-all"
                                disabled={isPlacing}
                            >
                                {isPlacing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing Order…
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Proceed to Pay ₹{total.toLocaleString("en-IN")}
                                    </>
                                )}
                            </Button>

                            <p className="flex items-center justify-center text-[11px] text-muted-foreground text-center">
                                <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-primary" /> Safe &amp; Encrypted 256-Bit SSL Checkout powered by Razorpay
                            </p>

                            <p className="text-center text-[10px] text-muted-foreground leading-relaxed">
                                By placing an order, you agree to our{" "}
                                <Link href="/terms" target="_blank" className="text-primary underline">Terms</Link>,{" "}
                                <Link href="/privacy" target="_blank" className="text-primary underline">Privacy</Link>, &amp;{" "}
                                <Link href="/refund-policy" target="_blank" className="text-primary underline">Refunds</Link>.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mobile Sticky Bottom Payment Dock */}
                <div
                    aria-label="Mobile Checkout Payment Bar"
                    className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/95 backdrop-blur-xl border-t border-border/80 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.12)]"
                    style={{ paddingBottom: "max(0.6rem, env(safe-area-inset-bottom, 0px))" }}
                >
                    <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                Total Payable
                            </span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-black text-foreground">
                                    ₹{total.toLocaleString("en-IN")}
                                </span>
                                {shipping === 0 ? (
                                    <span className="text-[10px] text-primary font-bold">Free Shipping</span>
                                ) : null}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            className="h-11 px-5 text-xs sm:text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md rounded-xl active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
                            disabled={isPlacing}
                        >
                            {isPlacing ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    <span>Processing…</span>
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="h-4 w-4" />
                                    <span>Proceed to Pay</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}

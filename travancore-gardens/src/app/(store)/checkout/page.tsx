"use client";

import Image from "next/image";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { CreditCard, CheckCircle2, Package, User, ShieldCheck, Loader2, Tag, X, Mail, Phone, MapPin, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cartStore";
import { useMyProfile, useMyAddresses } from "@/hooks/useSupabase";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
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
    const [appliedCoupon, setAppliedCoupon] = useState<{ id: string; code: string; discount_type: string; discount_value: number; min_order_value: number } | null>(null);
    const [couponLoading, setCouponLoading] = useState(false);

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

    // Auto-select default address if user is logged in
    useState(() => {
        if (addresses && (addresses as any[]).length > 0 && !selectedAddressId) {
            const def = (addresses as any[]).find((a: any) => a.is_default) || addresses[0];
            if (def) setSelectedAddressId(def.id);
        }
    });

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
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        const supabase = createClient();

        try {
            const { data: coupon, error } = await supabase
                .from("coupons")
                .select("*")
                .eq("code", couponCode.trim().toUpperCase())
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
                setOrderError("Please enter a valid email address for order confirmation.");
                toast.error("Please enter a valid email address.");
                return;
            }
            if (!form.address_line1?.trim()) {
                setOrderError("Please enter your address (House/Flat, Street).");
                toast.error("Please enter your address.");
                return;
            }
            if (!form.city?.trim() || !form.state?.trim()) {
                setOrderError("Please enter your city and state.");
                toast.error("Please enter your city and state.");
                return;
            }
            if (!form.pincode || form.pincode.replace(/\D/g, "").length < 6) {
                setOrderError("Please enter a valid 6-digit pincode.");
                toast.error("Please enter a valid 6-digit pincode.");
                return;
            }
        }

        setIsPlacing(true);

        try {
            // Send to server API route /api/orders (supports both guest & logged in users safely)
            const orderPayload = {
                items,
                address: isUsingSavedAddress ? null : {
                    full_name: form.full_name.trim(),
                    email: user?.email || form.email.trim(),
                    phone: form.phone.trim(),
                    address_line1: form.address_line1.trim(),
                    address_line2: form.address_line2.trim(),
                    city: form.city.trim(),
                    state: form.state.trim(),
                    pincode: form.pincode.trim(),
                    country: "India",
                },
                address_id: isUsingSavedAddress ? selectedAddressId : null,
                total_amount: total,
                shipping_cost: shipping,
                discount_amount: discount,
                weight: totalWeight,
                coupon_code: appliedCoupon?.code || null,
                payment_method: paymentMethod,
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
            const customerEmail = user?.email || form.email || "orders@travancoregardens.com";
            const customerPhone = form.phone || profile?.phone || "";

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
                amount: rzpOrder.amount,
                currency: rzpOrder.currency,
                name: "Travancore Gardens",
                description: "Plant Order Checkout",
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
                theme: { color: "#166534" },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on("payment.failed", function (response: any) {
                setOrderError(`Payment failed: ${response.error.description}`);
            });
            rzp.open();
        } catch (err: any) {
            setOrderError(err.message ?? "Something went wrong. Please try again.");
            toast.error(err.message ?? "Failed to place order.");
        } finally {
            setIsPlacing(false);
        }
    };

    if (!items.length) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
                <p className="text-muted-foreground mb-6">Explore our curated collection of healthy indoor plants.</p>
                <Button asChild size="lg">
                    <Link href="/shop">Browse Plants</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

            <div className="max-w-6xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading">Checkout</h1>
                    <p className="text-sm text-muted-foreground mt-1">Complete your order with easy guest checkout or account login</p>
                </div>

                {!user ? (
                    <div className="inline-flex items-center gap-2 p-2 px-4 rounded-xl bg-muted/60 border text-xs text-muted-foreground">
                        <span>Already registered?</span>
                        <Link href="/login?redirect=/checkout" className="text-primary font-semibold hover:underline inline-flex items-center gap-1">
                            <LogIn className="h-3 w-3" /> Log In
                        </Link>
                    </div>
                ) : (
                    <div className="inline-flex items-center gap-2 p-2 px-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-xs text-green-800 dark:text-green-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                        <span>Logged in as <strong>{profile?.name || user.email}</strong></span>
                    </div>
                )}
            </div>

            <form onSubmit={handlePlaceOrder}>
                <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
                    {/* Left: Shipping & Payment Details */}
                    <div className="flex-1 space-y-8">
                        {/* 1. Contact Information */}
                        <section className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">1. Contact Information</h2>
                                    <p className="text-xs text-muted-foreground mt-0.5">We&apos;ll use this to send order updates &amp; delivery notifications</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="checkout-name">Full Name</Label>
                                    <Input
                                        id="checkout-name"
                                        value={form.full_name || profile?.name || ""}
                                        onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                                        placeholder="E.g. Rahul Sharma"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="checkout-email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="checkout-email"
                                            type="email"
                                            value={user?.email || form.email}
                                            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                            readOnly={!!user}
                                            className={user ? "bg-muted pl-9" : "pl-9"}
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </div>
                                    {user && <span className="text-[11px] text-muted-foreground">Connected to your account</span>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="checkout-phone">Mobile Number (for Courier)</Label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-muted-foreground text-sm font-medium">
                                            +91
                                        </span>
                                        <Input
                                            id="checkout-phone"
                                            type="tel"
                                            value={form.phone}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                                                }))
                                            }
                                            placeholder="98765 43210"
                                            className="rounded-l-none"
                                            maxLength={10}
                                            required
                                        />
                                    </div>
                                    <span className="text-[11px] text-muted-foreground">Delivery agent will call this number</span>
                                </div>
                            </div>
                        </section>

                        {/* 2. Shipping Address */}
                        <section className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <MapPin className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">2. Shipping Address</h2>
                                    <p className="text-xs text-muted-foreground mt-0.5">Where should we deliver your healthy plants?</p>
                                </div>
                            </div>

                            {/* Saved Addresses for Logged-In Users */}
                            {user && addresses && (addresses as any[]).length > 0 ? (
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        {(addresses as any[]).map((addr: any) => (
                                            <label
                                                key={addr.id}
                                                className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
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
                                                <div className="text-sm">
                                                    <p className="font-semibold text-foreground">
                                                        {addr.full_name}{" "}
                                                        {addr.is_default && (
                                                            <span className="text-xs text-primary font-normal bg-primary/10 px-2 py-0.5 rounded-full ml-1">
                                                                Default
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-muted-foreground mt-0.5">
                                                        {addr.address_line1}
                                                        {addr.address_line2 ? `, ${addr.address_line2}` : ""},{" "}
                                                        {addr.city}, {addr.state} — {addr.pincode}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                        <Phone className="h-3 w-3" /> {addr.phone}
                                                    </p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedAddressId(null)}
                                            className={`text-xs font-semibold ${!selectedAddressId ? "text-primary underline" : "text-muted-foreground hover:text-foreground"}`}
                                        >
                                            + Deliver to a different address
                                        </button>
                                    </div>
                                </div>
                            ) : null}

                            {/* Manual Address Input Form (shown if guest or adding new address) */}
                            {(!user || !addresses || (addresses as any[]).length === 0 || !selectedAddressId) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="address-1">House / Flat / Building No. &amp; Street</Label>
                                        <Input
                                            id="address-1"
                                            value={form.address_line1}
                                            onChange={(e) => setForm((f) => ({ ...f, address_line1: e.target.value }))}
                                            placeholder="E.g. Flat 402, Green Meadows, MG Road"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="address-2">Area / Locality / Landmark (Optional)</Label>
                                        <Input
                                            id="address-2"
                                            value={form.address_line2}
                                            onChange={(e) => setForm((f) => ({ ...f, address_line2: e.target.value }))}
                                            placeholder="Near Botanical Garden, Opposite Post Office"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="city">City / Town</Label>
                                        <Input
                                            id="city"
                                            value={form.city}
                                            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                                            placeholder="Kochi / Thiruvananthapuram / Bangalore"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="state">State</Label>
                                        <Input
                                            id="state"
                                            value={form.state}
                                            onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                                            placeholder="Kerala / Karnataka / Tamil Nadu"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="pincode">Pincode</Label>
                                        <Input
                                            id="pincode"
                                            value={form.pincode}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                                                }))
                                            }
                                            placeholder="682001"
                                            maxLength={6}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="country">Country</Label>
                                        <Input id="country" value="India" readOnly className="bg-muted text-muted-foreground" />
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* 3. Payment Method */}
                        <section className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <CreditCard className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">3. Payment Method</h2>
                                    <p className="text-xs text-muted-foreground mt-0.5">Choose your preferred payment method</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {[
                                    {
                                        id: "card",
                                        title: "Cards & Netbanking (Razorpay)",
                                        desc: "Pay securely using Visa, Mastercard, RuPay, or Netbanking",
                                    },
                                    {
                                        id: "upi",
                                        title: "UPI (Google Pay / PhonePe / Paytm / QR)",
                                        desc: "Instant payment via any UPI app",
                                    },
                                ].map((opt) => (
                                    <label
                                        key={opt.id}
                                        className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
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
                                            <span className="font-semibold text-sm text-foreground block">{opt.title}</span>
                                            <span className="text-xs text-muted-foreground">{opt.desc}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right: Order Summary Sidebar */}
                    <div className="w-full lg:w-[420px]">
                        <div className="border border-border/50 rounded-xl p-6 bg-muted/30 sticky top-24 shadow-sm">
                            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-1">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="h-16 w-16 bg-card rounded-lg shrink-0 border overflow-hidden relative">
                                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-bl-md z-10">
                                                {item.quantity}
                                            </div>
                                            {item.image_url ? (
                                                <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="64px" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                                    <Package className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <p className="font-medium text-sm text-foreground line-clamp-1">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="flex items-center font-semibold text-sm">
                                            ₹{((item.sale_price ?? item.price) * item.quantity).toLocaleString("en-IN")}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Separator className="my-4" />

                            {/* Coupon Code */}
                            <div className="mb-6">
                                {!appliedCoupon ? (
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Promo / Coupon code"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            className="bg-card"
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={handleApplyCoupon}
                                            disabled={couponLoading || !couponCode}
                                        >
                                            {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-primary" />
                                            <span className="font-semibold text-primary">{appliedCoupon.code}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveCoupon}
                                            className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Subtotal / Shipping / Total Breakdown */}
                            <div className="space-y-3 mb-6 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
                                </div>

                                {discount > 0 && (
                                    <div className="flex justify-between text-primary">
                                        <span>Discount</span>
                                        <span className="font-medium">-₹{discount.toLocaleString("en-IN")}</span>
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className={`font-medium ${shipping === 0 ? "text-primary" : ""}`}>
                                        {shipping === 0 ? "Free Shipping" : `₹${shipping}`}
                                    </span>
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="flex justify-between items-center mb-6 text-xl font-bold">
                                <span>Total Amount</span>
                                <span className="text-primary">₹{total.toLocaleString("en-IN")}</span>
                            </div>

                            {orderError && (
                                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg">
                                    {orderError}
                                </div>
                            )}

                            {/* Main CTA button: Active for guests and registered users! */}
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full h-14 text-base font-semibold shadow-md"
                                disabled={isPlacing}
                            >
                                {isPlacing ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="mr-2 h-5 w-5" />
                                )}
                                {isPlacing
                                    ? "Processing Order…"
                                    : `Proceed to Pay ₹${total.toLocaleString("en-IN")}`}
                            </Button>

                            <p className="mt-4 flex items-center justify-center text-xs text-muted-foreground">
                                <ShieldCheck className="mr-1.5 h-4 w-4 text-primary" /> Safe &amp; Encrypted 256-Bit SSL Checkout powered by Razorpay
                            </p>

                            <p className="mt-3 text-center text-[11px] text-muted-foreground leading-relaxed">
                                By placing an order, you agree to our{" "}
                                <Link href="/terms" target="_blank" className="text-primary underline hover:text-primary/80">Terms</Link>,{" "}
                                <Link href="/privacy" target="_blank" className="text-primary underline hover:text-primary/80">Privacy</Link>,{" "}
                                <Link href="/refund-policy" target="_blank" className="text-primary underline hover:text-primary/80">Refunds</Link>, &amp;{" "}
                                <Link href="/shipping-policy" target="_blank" className="text-primary underline hover:text-primary/80">Shipping</Link>.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

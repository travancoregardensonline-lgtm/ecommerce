"use client";

import Image from "next/image";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { CreditCard, CheckCircle2, Package, User, ShieldCheck, Loader2, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cartStore";
import { useMyProfile, useMyAddresses } from "@/hooks/useSupabase";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { authActions, ensureProfile } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function CheckoutPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { items, clearCart } = useCartStore();
    const { data: profile } = useMyProfile();
    const { data: addresses } = useMyAddresses();

    const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "cod">("card");
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [isPlacing, setIsPlacing] = useState(false);
    const [orderError, setOrderError] = useState<string | null>(null);

    // OTP / Auth states for guests
    const [authStep, setAuthStep] = useState<"details" | "otp">("details");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);


    // Coupon states
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{ id: string, code: string, discount_type: string, discount_value: number, min_order_value: number } | null>(null);
    const [couponLoading, setCouponLoading] = useState(false);

    // Form state for new address (if no saved addresses)
    const [form, setForm] = useState({
        full_name: profile?.name ?? "", phone: profile?.phone ?? "",
        address_line1: "", address_line2: "", city: "", state: "", pincode: "",
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

    // Handlers
    
    const handleSendOTP = async () => {
        if (!form.phone || form.phone.length !== 10) {
            setAuthError("Please enter a valid 10-digit mobile number.");
            return;
        }
        setAuthLoading(true);
        setAuthError(null);
        const result = await authActions.sendPhoneOTP(form.phone);
        setAuthLoading(false);
        if (result.error) {
            setAuthError(result.error.message ?? "Failed to send OTP.");
            return;
        }
        setAuthStep("otp");
    };

    const handleVerifyOTP = async () => {
        const token = otp.join("");
        if (token.length !== 6) {
            setAuthError("Please enter all 6 digits.");
            return;
        }
        setAuthLoading(true);
        setAuthError(null);
        const result = await authActions.verifyPhoneOTP(form.phone, token);
        setAuthLoading(false);
        if (result.error) {
            setAuthError("Invalid or expired OTP.");
            return;
        }
        
        const currentUser = await authActions.getCurrentUser();
        if (currentUser) {
            await ensureProfile(currentUser.id, form.phone, form.full_name);
            setAuthStep("details");
            toast.success("Successfully logged in!");
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const next = [...otp];
        next[index] = value;
        setOtp(next);
        if (value && index < 5) {
            document.getElementById(`checkout-otp-${index + 1}`)?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            document.getElementById(`checkout-otp-${index - 1}`)?.focus();
        }
    };

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

        } catch (err) {
            toast.error("Failed to verify coupon.");
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        toast.info("Coupon removed.");
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setOrderError(null);
        if (!user) { toast.error("Please verify your phone number to continue."); return; }
        if (!items.length) return;

        if (addresses && (addresses as any[]).length > 0 && !selectedAddressId) {
            toast.error("Please select a shipping address.");
            return;
        }

        setIsPlacing(true);
        const supabase = createClient();

        try {
            // Resolve address
            let addressId = selectedAddressId;
            if (!addressId) {
                const { data: addr, error: addrErr } = await supabase
                    .from("addresses")
                    .insert({ ...form, user_id: user.id, country: "India" })
                    .select().single();
                if (addrErr) throw new Error(addrErr.message ?? "Failed to save address");
                addressId = addr.id;
            }

            // Create order
            const { data: order, error: orderErr } = await supabase
                .from("orders")
                .insert({
                    user_id: user.id,
                    address_id: addressId,
                    total_amount: total,
                    shipping_cost: shipping,
                    discount_amount: discount,
                    weight: totalWeight,
                    coupon_code: appliedCoupon?.code || null,
                    payment_method: paymentMethod,
                    payment_status: "pending",
                    order_status: "pending",
                })
                .select().single();

            if (orderErr) throw new Error(orderErr.message ?? "Failed to create order");
            if (!order) throw new Error("Order creation returned no data");

            // Update coupon usage count if used
            if (appliedCoupon) {
                const { error: rpcErr } = await supabase.rpc('increment_coupon_usage', { coupon_id: appliedCoupon.id });
                if (rpcErr) {
                    await supabase.from("coupons").update({ usage_count: (appliedCoupon as any).usage_count + 1 }).eq("id", appliedCoupon.id);
                }
            }

            // Create order items
            const { error: itemsErr } = await supabase.from("order_items").insert(
                items.map(i => ({
                    order_id: order.id,
                    product_id: i.product_id,
                    quantity: i.quantity,
                    price: i.sale_price ?? i.price,
                }))
            );
            if (itemsErr) throw new Error(itemsErr.message ?? "Failed to save order items");

            if (paymentMethod === "cod") {
                clearCart();
                router.push(`/order-success?order=${order.id}`);
            } else {
                // Connect to Razorpay Server Implementation
                const rzpRes = await fetch("/api/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount: total, receipt: order.id })
                });

                const rzpOrder = await rzpRes.json();

                if (!rzpRes.ok) throw new Error(rzpOrder.error || "Failed to initialize payment gateway.");

                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
                    amount: rzpOrder.amount,
                    currency: rzpOrder.currency,
                    name: "Travancore Gardens",
                    description: "Order Checkout",
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
                                    supabase_order_id: order.id
                                })
                            });
                            const verifyData = await verifyRes.json();
                            if (verifyData.success) {
                                clearCart();
                                router.push(`/order-success?order=${order.id}`);
                            } else {
                                setOrderError(verifyData.error || "Payment Verification Exception.");
                            }
                        } catch (err) {
                            setOrderError("Verification failed, try again later.");
                        }
                    },
                    prefill: {
                        name: profile?.name || form.full_name || "Customer",
                        email: user.email,
                        contact: profile?.phone || form.phone || ""
                    },
                    theme: { color: "#166534" }
                };

                const rzp = new (window as any).Razorpay(options);
                rzp.on('payment.failed', function (response: any) {
                    setOrderError(`Payment failed: ${response.error.description}`);
                });
                rzp.open();
            }

        } catch (err: any) {
            setOrderError(err.message ?? "Something went wrong. Please try again.");
        } finally {
            setIsPlacing(false);
        }
    };

    if (!items.length) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
                <Button asChild><a href="/shop">Shop Plants</a></Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
            <h1 className="text-3xl font-bold font-heading mb-8">Checkout</h1>
            <form onSubmit={handlePlaceOrder}>
                <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">

                    {/* Left: Forms */}
                    <div className="flex-1 space-y-8">
                        {/* Contact */}
                        <section className="bg-card border border-border/50 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-4 w-4 text-primary" />
                                </div>
                                <h2 className="text-xl font-semibold">{!user ? "Sign In to Checkout" : "Contact Information"}</h2>
                            </div>
                            
                            {!user ? (
                                <div className="space-y-6">
                                    {authError && (
                                        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
                                            {authError}
                                        </div>
                                    )}
                                    {authStep === "details" ? (
                                        <>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Mobile Number</Label>
                                                    <div className="flex">
                                                        <span className="inline-flex items-center px-4 border border-r-0 rounded-l-md bg-muted text-muted-foreground text-sm font-medium border-input">
                                                            +91
                                                        </span>
                                                        <Input
                                                            type="tel"
                                                            value={form.phone}
                                                            onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                                                            placeholder="98765 43210"
                                                            className="rounded-l-none"
                                                            maxLength={10}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Full Name (if new)</Label>
                                                    <Input
                                                        value={form.full_name}
                                                        onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                                                        placeholder="Your full name"
                                                    />
                                                </div>
                                            </div>
                                            <Button type="button" onClick={handleSendOTP} disabled={authLoading || form.phone.length !== 10} className="w-full">
                                                {authLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Verify Phone to Continue
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <Label className="text-center block">Enter 6-Digit OTP</Label>
                                                <div className="flex gap-2 justify-center">
                                                    {otp.map((digit, i) => (
                                                        <input
                                                            key={i}
                                                            id={`checkout-otp-${i}`}
                                                            type="text"
                                                            inputMode="numeric"
                                                            pattern="[0-9]"
                                                            maxLength={1}
                                                            value={digit}
                                                            onChange={(e) => handleOtpChange(i, e.target.value)}
                                                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                                            className={cn(
                                                                "h-12 w-10 sm:w-12 text-center text-xl font-bold border rounded-lg bg-background",
                                                                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                                                                digit ? "border-primary" : "border-input"
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-xs text-center text-muted-foreground">Sent to +91 {form.phone}</p>
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <Button type="button" onClick={handleVerifyOTP} disabled={authLoading} className="w-full">
                                                    {authLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Verify & Continue
                                                </Button>
                                                <button type="button" onClick={() => {setAuthStep("details"); setOtp(["","","","","",""]);}} className="text-sm text-muted-foreground hover:text-foreground">
                                                    Change phone number
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Full Name</Label>
                                        <Input
                                            value={form.full_name || profile?.name || ""}
                                            onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                                            placeholder="Your full name" required
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Email</Label>
                                        <Input type="email" value={user?.email ?? ""} readOnly className="bg-muted" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Phone</Label>
                                        <Input
                                            type="tel"
                                            value={form.phone || profile?.phone || ""}
                                            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                            placeholder="+91 98765 43210" required
                                        />
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Saved Addresses or New */}
                        {user && (
                            <>
                        <section className="bg-card border border-border/50 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Package className="h-4 w-4 text-primary" />
                                </div>
                                <h2 className="text-xl font-semibold">Shipping Address</h2>
                            </div>
                            {(addresses as any[])?.length > 0 ? (
                                <div className="space-y-3">
                                    {(addresses as any[]).map((addr: any) => (
                                        <label
                                            key={addr.id}
                                            className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${selectedAddressId === addr.id ? "border-primary bg-primary/5" : "hover:border-primary/40"}`}
                                        >
                                            <input
                                                type="radio"
                                                name="address"
                                                className="mt-1 h-4 w-4 accent-primary"
                                                checked={selectedAddressId === addr.id}
                                                onChange={() => setSelectedAddressId(addr.id)}
                                            />
                                            <div className="text-sm">
                                                <p className="font-semibold">{addr.full_name} {addr.is_default && <span className="text-xs text-primary ml-1">(Default)</span>}</p>
                                                <p className="text-muted-foreground">{addr.address_line1}, {addr.city}, {addr.state} — {addr.pincode}</p>
                                                <p className="text-muted-foreground">{addr.phone}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Address Line 1</Label>
                                        <Input value={form.address_line1} onChange={e => setForm(f => ({ ...f, address_line1: e.target.value }))} placeholder="House/Flat No., Street" required />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Address Line 2</Label>
                                        <Input value={form.address_line2} onChange={e => setForm(f => ({ ...f, address_line2: e.target.value }))} placeholder="Area, Landmark (optional)" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>City</Label>
                                        <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Mumbai" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>State</Label>
                                        <Input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} placeholder="Maharashtra" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Pincode</Label>
                                        <Input value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} placeholder="400001" maxLength={6} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Country</Label>
                                        <Input value="India" readOnly className="bg-muted" />
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Payment */}
                        <section className="bg-card border border-border/50 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <CreditCard className="h-4 w-4 text-primary" />
                                </div>
                                <h2 className="text-xl font-semibold">Payment Method</h2>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { id: "card", label: "Credit / Debit Card (Razorpay)" },
                                    { id: "upi", label: "UPI (Razorpay)" },
                                    { id: "cod", label: "Cash on Delivery" },
                                ].map(opt => (
                                    <label
                                        key={opt.id}
                                        className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors ${paymentMethod === opt.id ? "border-primary bg-primary/5" : ""}`}
                                    >
                                        <input type="radio" name="payment" value={opt.id}
                                            checked={paymentMethod === opt.id}
                                            onChange={() => setPaymentMethod(opt.id as any)}
                                            className="h-4 w-4 accent-primary"
                                        />
                                        <span className="font-medium">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </section>
                            </>
                        )}
                    </div>

                    {/* Right: Order Summary */}
                    <div className="w-full lg:w-[420px]">
                        <div className="border border-border/50 rounded-xl p-6 bg-muted/30 sticky top-24">
                            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                {items.map(item => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="h-16 w-16 bg-card rounded-md shrink-0 border overflow-hidden relative">
                                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-bl-md z-10">
                                                {item.quantity}
                                            </div>
                                            {item.image_url && (
                                                <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="64px" />
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <p className="font-medium text-sm">{item.name}</p>
                                        </div>
                                        <div className="flex items-center font-medium text-sm">
                                            ₹{((item.sale_price ?? item.price) * item.quantity).toLocaleString("en-IN")}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Separator className="my-4" />

                            {/* Coupon Section */}
                            <div className="mb-6">
                                {!appliedCoupon ? (
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Discount code"
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
                                    <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-md">
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
                                        {shipping === 0 ? "Free" : `₹${shipping}`}
                                    </span>
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="flex justify-between items-center mb-8 text-xl font-bold">
                                <span>Total</span>
                                <span>₹{total.toLocaleString("en-IN")}</span>
                            </div>

                            {orderError && (
                                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg">
                                    {orderError}
                                </div>
                            )}

                            <Button type="submit" size="lg" className="w-full h-14 text-lg" disabled={!user || isPlacing}>
                                {isPlacing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                                {!user ? "Sign In to Place Order" : isPlacing ? "Processing..." : "Place Order"}
                            </Button>

                            <p className="mt-4 flex items-center justify-center text-xs text-muted-foreground">
                                <ShieldCheck className="mr-1 h-3 w-3" /> Payments are secure and encrypted.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

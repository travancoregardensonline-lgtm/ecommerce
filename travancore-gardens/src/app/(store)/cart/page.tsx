"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, Trash2, Truck, ShieldCheck, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { CartItem } from "@/components/cart/CartItem";
import { useCartStore } from "@/store/cartStore";

export default function CartPage() {
    const { items, removeItem, updateQuantity, clearCart } = useCartStore();

    const subtotal = items.reduce(
        (acc, item) => acc + (item.sale_price ?? item.price) * item.quantity,
        0
    );
    const freeShippingThreshold = 1500;
    const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 99;
    const total = subtotal + shipping;
    const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
    const shippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center max-w-md">
                <div className="mx-auto w-20 h-20 bg-muted/60 rounded-full flex items-center justify-center mb-5">
                    <ShoppingBag className="h-9 w-9 text-muted-foreground" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold font-heading mb-2 text-foreground">
                    Your cart is empty
                </h1>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    You haven&apos;t added any plants yet. Explore our lush nursery catalog to get started.
                </p>
                <Button size="lg" className="rounded-xl w-full sm:w-auto font-semibold" asChild>
                    <Link href="/shop">Browse Plants &rarr;</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 pb-36 md:pb-16 max-w-6xl">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground">
                        Shopping Cart
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        {items.length} item{items.length !== 1 ? "s" : ""} selected
                    </p>
                </div>
                <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-muted"
                >
                    <Trash2 className="h-3.5 w-3.5" /> Clear All
                </button>
            </div>

            {/* Free Shipping Meter Banner */}
            <div className="mb-6 p-3.5 sm:p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Truck className="h-4 w-4 text-primary shrink-0" />
                        {shipping === 0 ? (
                            <span className="text-primary font-bold">🎉 Free Delivery Unlocked!</span>
                        ) : (
                            <span>
                                Add <strong className="text-primary font-bold">₹{amountNeededForFreeShipping.toLocaleString("en-IN")}</strong> more for Free Delivery
                            </span>
                        )}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                        {shippingProgress}%
                    </span>
                </div>
                <div className="w-full bg-border/60 rounded-full h-2 overflow-hidden">
                    <div
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${shippingProgress}%` }}
                    />
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* Cart Items List */}
                <div className="flex-1">
                    <div className="border border-border/70 rounded-2xl p-4 sm:p-6 bg-card shadow-sm space-y-0">
                        {items.map((item) => (
                            <CartItem
                                key={item.id}
                                item={{
                                    id: item.product_id,
                                    productId: item.product_id,
                                    name: item.name,
                                    slug: item.slug,
                                    price: item.sale_price ?? item.price,
                                    quantity: item.quantity,
                                    variant: item.variant,
                                    imageUrl:
                                        item.image_url ||
                                        "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=300",
                                }}
                                onUpdateQuantity={(productId, qty) => updateQuantity(productId, qty)}
                                onRemove={(productId) => removeItem(productId)}
                            />
                        ))}
                    </div>

                    <div className="mt-4 flex justify-between items-center text-xs text-muted-foreground px-2">
                        <Link href="/shop" className="text-primary hover:underline font-semibold flex items-center gap-1">
                            &larr; Continue Shopping
                        </Link>
                        <span>Need help? WhatsApp +91 85908 09000</span>
                    </div>
                </div>

                {/* Desktop & Inline Order Summary */}
                <div className="w-full lg:w-[380px]">
                    <div className="border border-border/70 rounded-2xl p-5 sm:p-6 bg-card sticky top-24 shadow-sm">
                        <h2 className="text-lg font-bold mb-5 text-foreground tracking-tight">
                            Order Summary
                        </h2>

                        <div className="space-y-3.5 mb-5 text-xs sm:text-sm text-muted-foreground">
                            <div className="flex justify-between">
                                <span>Subtotal ({items.length} items)</span>
                                <span className="font-semibold text-foreground">
                                    ₹{subtotal.toLocaleString("en-IN")}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Shipping</span>
                                <span className="font-semibold text-foreground">
                                    {shipping === 0 ? (
                                        <span className="text-primary font-bold">FREE</span>
                                    ) : (
                                        `₹${shipping}`
                                    )}
                                </span>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="flex justify-between items-baseline mb-5 text-base sm:text-lg font-bold text-foreground">
                            <span>Estimated Total</span>
                            <span className="text-xl font-black text-primary">
                                ₹{total.toLocaleString("en-IN")}
                            </span>
                        </div>

                        {/* Coupon Code Input */}
                        <div className="mb-5">
                            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                                <div className="relative flex-1">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        placeholder="Promo Code"
                                        className="pl-8 text-xs bg-muted/30 rounded-xl"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl text-xs font-semibold px-3"
                                >
                                    Apply
                                </Button>
                            </form>
                        </div>

                        {/* In-page Checkout CTA Button */}
                        <Button size="lg" className="w-full h-12 text-sm sm:text-base font-bold rounded-xl shadow-md" asChild>
                            <Link href="/checkout">
                                Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>

                        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-center gap-2 text-[11px] text-muted-foreground text-center">
                            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                            <span>100% Safe &amp; Secure Razorpay Checkout</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Persistent Sticky Checkout Dock */}
            <div
                aria-label="Mobile Checkout Dock"
                className="fixed bottom-15 left-0 right-0 z-35 md:hidden bg-background/95 backdrop-blur-xl border-t border-border/80 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]"
            >
                <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
                    <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                            Total Payable
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-foreground">
                                ₹{total.toLocaleString("en-IN")}
                            </span>
                            {shipping === 0 ? (
                                <span className="text-[10px] text-primary font-bold">Free Delivery</span>
                            ) : null}
                        </div>
                    </div>

                    <Button
                        size="lg"
                        className="h-11 px-5 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md rounded-xl active:scale-95 transition-all flex items-center gap-1.5"
                        asChild
                    >
                        <Link href="/checkout">
                            <span>Checkout</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

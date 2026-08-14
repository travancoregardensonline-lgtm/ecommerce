"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { CartItem } from "@/components/cart/CartItem";
import { useCartStore } from "@/store/cartStore";

export default function CartPage() {
    const { items, removeItem, updateQuantity, clearCart } = useCartStore();

    const subtotal = items.reduce((acc, item) => acc + (item.sale_price ?? item.price) * item.quantity, 0);
    const shipping = subtotal > 1500 ? 0 : 99;
    const total = subtotal + shipping;

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-24 text-center max-w-2xl">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                </div>
                <h1 className="text-3xl font-bold font-heading mb-4 text-foreground">Your cart is empty</h1>
                <p className="text-muted-foreground mb-8">Looks like you haven&apos;t added any plants to your cart yet.</p>
                <Button size="lg" asChild>
                    <Link href="/shop">Continue Shopping</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold font-heading text-foreground">Shopping Cart</h1>
                <button
                    onClick={clearCart}
                    className="text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1.5"
                >
                    <Trash2 className="h-3.5 w-3.5" /> Clear Cart
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Cart Items */}
                <div className="flex-1">
                    <div className="border border-border/50 rounded-lg p-6 bg-card space-y-0">
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
                                    imageUrl: item.image_url || "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=300",
                                }}
                                onUpdateQuantity={(productId, qty) => updateQuantity(productId, qty)}
                                onRemove={(productId) => removeItem(productId)}
                            />
                        ))}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="w-full lg:w-[400px]">
                    <div className="border border-border/50 rounded-lg p-6 bg-muted/20 sticky top-24">
                        <h2 className="text-xl font-semibold mb-6 text-foreground tracking-tight">Order Summary</h2>

                        <div className="space-y-4 mb-6 text-sm text-muted-foreground">
                            <div className="flex justify-between">
                                <span>Subtotal ({items.length} item{items.length !== 1 ? "s" : ""})</span>
                                <span className="font-medium text-foreground">₹{subtotal.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span className="font-medium text-foreground">
                                    {shipping === 0 ? <span className="text-primary font-semibold">Free</span> : `₹${shipping}`}
                                </span>
                            </div>
                            {shipping > 0 && (
                                <p className="text-xs text-primary/80">
                                    Add <span className="font-semibold">₹{(1500 - subtotal).toLocaleString("en-IN")}</span> more for free shipping!
                                </p>
                            )}
                        </div>

                        <Separator className="my-4" />

                        <div className="flex justify-between items-center mb-6 text-lg font-bold text-foreground">
                            <span>Total</span>
                            <span>₹{total.toLocaleString("en-IN")}</span>
                        </div>

                        <div className="mb-6">
                            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                                <Input placeholder="Discount code" className="flex-1 bg-background" />
                                <Button type="button" variant="secondary">Apply</Button>
                            </form>
                        </div>

                        <Button size="lg" className="w-full h-14 text-lg" asChild>
                            <Link href="/checkout">
                                Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>

                        <p className="mt-4 text-xs text-center text-muted-foreground">
                            Taxes calculated at checkout. Secured with 256-bit encryption.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

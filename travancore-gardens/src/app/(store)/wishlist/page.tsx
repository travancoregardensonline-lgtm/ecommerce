"use client";

import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/store/ProductCard";
import Link from "next/link";
import { useWishlistStore } from "@/store/wishlistStore";
import { useEffect, useState } from "react";

export default function WishlistPage() {
    const { items: wishlistItems } = useWishlistStore();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    return (
        <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 pb-24 md:pb-12 max-w-6xl">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground">
                        My Wishlist
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        {wishlistItems.length} saved plant{wishlistItems.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold" asChild>
                    <Link href="/shop">Browse Plants</Link>
                </Button>
            </div>

            {wishlistItems.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-2xl border border-border/60 p-6 max-w-md mx-auto">
                    <Heart className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                    <h2 className="text-xl font-bold font-heading mb-1 text-foreground">
                        Your wishlist is empty
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-6 leading-relaxed">
                        Tap the heart icon on any plant to save it for later and check back anytime.
                    </p>
                    <Button className="rounded-xl font-semibold" asChild>
                        <Link href="/shop">
                            <ShoppingBag className="h-4 w-4 mr-1.5" /> Explore Plants
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                    {wishlistItems.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}

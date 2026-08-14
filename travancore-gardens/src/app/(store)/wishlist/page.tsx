"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard, Product } from "@/components/store/ProductCard";
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-6xl">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-bold font-heading">My Wishlist</h1>
                    <p className="text-muted-foreground mt-1">{wishlistItems.length} saved items</p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/shop">Continue Shopping</Link>
                </Button>
            </div>

            {wishlistItems.length === 0 ? (
                <div className="text-center py-24">
                    <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-6 opacity-40" />
                    <h2 className="text-2xl font-bold font-heading mb-2">Your wishlist is empty</h2>
                    <p className="text-muted-foreground mb-8">
                        Save plants you love and come back to them later.
                    </p>
                    <Button asChild>
                        <Link href="/shop">Browse Plants</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {wishlistItems.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}

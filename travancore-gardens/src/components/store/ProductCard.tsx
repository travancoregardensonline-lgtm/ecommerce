"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { clsx } from "clsx";
import { motion } from "framer-motion";

export interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice?: number | null;
    imageUrl: string;
    category?: string;
}

export function ProductCard({ product }: { product: Product }) {
    const router = useRouter();
    const { addItem } = useCartStore();
    const wishlist = useWishlistStore();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const isWishlisted = isClient ? wishlist.hasItem(product.id) : false;

    const toggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isWishlisted) {
            wishlist.removeItem(product.id);
            toast.info("Removed from wishlist");
        } else {
            wishlist.addItem(product);
            toast.success("Added to wishlist");
        }
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem({
            product_id: product.id,
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            sale_price: product.salePrice,
            image_url: product.imageUrl,
            quantity: 1,
            weight: (product as any).weight || 0.5,
        });
        toast.success(`Added ${product.name} to cart`, {
            action: {
                label: "View Cart",
                onClick: () => router.push("/cart"),
            },
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="h-full"
        >
            <Card className="overflow-hidden group h-full flex flex-col border border-border/60 shadow-sm hover:shadow-xl transition-all duration-300 bg-card relative rounded-2xl">
                {/* Image Section */}
                <Link
                    href={`/product/${product.slug}`}
                    className="relative aspect-[4/5] overflow-hidden bg-muted flex-shrink-0 block"
                >
                    <Image
                        src={
                            product.imageUrl ||
                            "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=600"
                        }
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />

                    {/* Floating Sale Badge */}
                    {product.salePrice && product.price > product.salePrice && (
                        <div className="absolute top-2.5 left-2.5 bg-primary text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-md z-10 uppercase tracking-wider backdrop-blur-md">
                            {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                        </div>
                    )}

                    {/* Quick Action Overlay (Wishlist) */}
                    <button
                        type="button"
                        onClick={toggleWishlist}
                        className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-md shadow-sm hover:scale-110 active:scale-90 transition-all z-20 flex items-center justify-center"
                        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        <Heart
                            className={clsx(
                                "h-4 w-4 transition-colors",
                                isWishlisted ? "text-red-500 fill-red-500" : "text-zinc-500 hover:text-red-500"
                            )}
                        />
                    </button>

                    {/* Desktop Hover Quick Add */}
                    <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/70 via-black/30 to-transparent hidden md:block">
                        <Button
                            size="sm"
                            className="w-full bg-white text-zinc-900 hover:bg-white/95 border-none h-9 font-bold text-xs uppercase tracking-wider shadow-lg"
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                            Quick Add
                        </Button>
                    </div>
                </Link>

                {/* Content Section */}
                <CardContent className="p-3 sm:p-4 flex-1 flex flex-col justify-between bg-card">
                    <div>
                        {product.category && (
                            <span className="text-[10px] font-bold text-primary mb-1 uppercase tracking-wider block opacity-85 truncate">
                                {product.category}
                            </span>
                        )}
                        <Link href={`/product/${product.slug}`} className="block group/link">
                            <h3 className="font-semibold text-xs sm:text-sm text-foreground line-clamp-2 leading-snug group-hover/link:text-primary transition-colors">
                                {product.name}
                            </h3>
                        </Link>
                    </div>

                    <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between gap-1.5">
                        <div className="flex flex-col min-w-0">
                            {product.salePrice ? (
                                <div className="flex items-baseline gap-1.5 flex-wrap">
                                    <span className="text-sm sm:text-base font-black text-foreground">
                                        ₹{product.salePrice.toLocaleString("en-IN")}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground line-through font-medium">
                                        ₹{product.price.toLocaleString("en-IN")}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-sm sm:text-base font-black text-foreground">
                                    ₹{product.price.toLocaleString("en-IN")}
                                </span>
                            )}
                        </div>

                        {/* Mobile Add to Cart Button */}
                        <Button
                            size="sm"
                            className="md:hidden h-8 px-2.5 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm active:scale-95 transition-all flex items-center gap-1 shrink-0"
                            onClick={handleAddToCart}
                            aria-label={`Add ${product.name} to cart`}
                        >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            <span>Add</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";

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
            weight: (product as any).weight || 0.5
        });
        toast.success("Added to cart");
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
            className="h-full"
        >
            <Card className="overflow-hidden group h-full flex flex-col border-none shadow-sm hover:shadow-xl transition-all duration-500 bg-white dark:bg-zinc-900 relative rounded-2xl">
                {/* Image Section */}
                <Link href={`/product/${product.slug}`} className="relative aspect-[4/5] overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0 block">
                    <Image
                        src={product.imageUrl || 'https://via.placeholder.com/300?text=No+Image'}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Floating Badge (Sale) */}
                    {product.salePrice && (
                        <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg z-10 uppercase tracking-widest backdrop-blur-md bg-opacity-90">
                            Offer
                        </div>
                    )}

                    {/* Quick Action Overlay (Wishlist) */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleWishlist}
                        className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 dark:bg-black/50 backdrop-blur-md shadow-sm hover:bg-white dark:hover:bg-black transition-all z-20"
                        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        <Heart
                            className={clsx(
                                "h-4 w-4 transition-colors",
                                isWishlisted ? "text-red-500 fill-red-500" : "text-zinc-400 group-hover:text-red-500"
                            )}
                        />
                    </motion.button>

                    {/* Hover Overlay for Cart (Desktop Only) */}
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 via-black/20 to-transparent hidden md:block">
                        <Button
                            className="w-full bg-white text-black hover:bg-white/90 border-none h-10 font-bold text-xs uppercase tracking-widest shadow-xl"
                            onClick={handleAddToCart}
                        >
                            Quick Add
                        </Button>
                    </div>
                </Link>

                <CardContent className="p-5 flex-1 flex flex-col bg-white dark:bg-zinc-900">
                    <div className="flex justify-between items-start mb-2 gap-2">
                        <div>
                            {product.category && (
                                <span className="text-[10px] font-bold text-primary mb-1 uppercase tracking-[0.15em] block opacity-80">
                                    {product.category}
                                </span>
                            )}
                            <Link href={`/product/${product.slug}`} className="block group/link">
                                <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-100 line-clamp-1 leading-tight group-hover/link:text-primary transition-colors">
                                    {product.name}
                                </h3>
                            </Link>
                        </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            {product.salePrice ? (
                                <>
                                    <span className="text-lg font-black text-zinc-900 dark:text-white">₹{product.salePrice.toLocaleString("en-IN")}</span>
                                    <span className="text-xs text-zinc-400 line-through font-medium">₹{product.price.toLocaleString("en-IN")}</span>
                                </>
                            ) : (
                                <span className="text-lg font-black text-zinc-900 dark:text-white">₹{product.price.toLocaleString("en-IN")}</span>
                            )}
                        </div>

                        {/* Mobile Only Cart Button */}
                        <Button
                            size="icon"
                            variant="ghost"
                            className="md:hidden h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-primary hover:text-white transition-colors"
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

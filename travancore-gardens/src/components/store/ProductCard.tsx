"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Plus, Minus, Check, Star } from "lucide-react";
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
    rating?: number;
}

export function ProductCard({ product }: { product: Product }) {
    const router = useRouter();
    const { items, addItem, updateQuantity, removeItem } = useCartStore();
    const wishlist = useWishlistStore();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const isWishlisted = isClient ? wishlist.hasItem(product.id) : false;
    const cartItem = isClient ? items.find((i) => i.product_id === product.id) : null;
    const cartQty = cartItem?.quantity ?? 0;

    const discountPercent =
        product.salePrice && product.price > product.salePrice
            ? Math.round(((product.price - product.salePrice) / product.price) * 100)
            : 0;

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

    const handleIncrease = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        updateQuantity(product.id, cartQty + 1);
    };

    const handleDecrease = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (cartQty <= 1) {
            removeItem(product.id);
            toast.info(`Removed ${product.name} from cart`);
        } else {
            updateQuantity(product.id, cartQty - 1);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.25 }}
            className="h-full"
        >
            <Card className="overflow-hidden group h-full flex flex-col border border-border/70 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-300 bg-card relative rounded-2xl">
                {/* Image Section */}
                <Link
                    href={`/product/${product.slug}`}
                    className="relative aspect-square sm:aspect-[4/5] overflow-hidden bg-muted/30 flex-shrink-0 block"
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

                    {/* Flipkart-style Discount Badge */}
                    {discountPercent > 0 && (
                        <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-sm z-10 tracking-tight">
                            {discountPercent}% OFF
                        </div>
                    )}

                    {/* Wishlist Heart Icon */}
                    <button
                        type="button"
                        onClick={toggleWishlist}
                        className="absolute top-2 right-2 p-2 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-md shadow-sm hover:scale-110 active:scale-90 transition-all z-20 flex items-center justify-center"
                        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        <Heart
                            className={clsx(
                                "h-4 w-4 transition-colors",
                                isWishlisted ? "text-red-500 fill-red-500" : "text-zinc-400 hover:text-red-500"
                            )}
                        />
                    </button>
                </Link>

                {/* Content Section following Flipkart layout */}
                <CardContent className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between bg-card gap-2">
                    <div className="space-y-1">
                        {/* Category & Assured Tag */}
                        <div className="flex items-center justify-between gap-1 text-[10px]">
                            {product.category && (
                                <span className="font-semibold text-muted-foreground uppercase tracking-wider truncate">
                                    {product.category}
                                </span>
                            )}
                            <span className="font-extrabold text-primary flex items-center gap-0.5 text-[9px] bg-primary/10 px-1.5 py-0.2 rounded shrink-0">
                                <Check className="h-2.5 w-2.5 stroke-[3]" /> Assured
                            </span>
                        </div>

                        {/* Title */}
                        <Link href={`/product/${product.slug}`} className="block group/link">
                            <h3 className="font-medium text-xs sm:text-sm text-foreground line-clamp-2 leading-snug group-hover/link:text-primary transition-colors">
                                {product.name}
                            </h3>
                        </Link>
                    </div>

                    {/* Pricing & Flipkart Action Button */}
                    <div className="pt-2 border-t border-border/40 flex items-end justify-between gap-1.5">
                        {/* Price Details */}
                        <div className="flex flex-col min-w-0">
                            {product.salePrice ? (
                                <div className="space-y-0.5">
                                    <div className="flex items-baseline gap-1.5 flex-wrap">
                                        <span className="text-sm sm:text-base font-black text-foreground">
                                            ₹{product.salePrice.toLocaleString("en-IN")}
                                        </span>
                                        <span className="text-[11px] text-muted-foreground line-through font-normal">
                                            ₹{product.price.toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block leading-none">
                                        {discountPercent}% off
                                    </span>
                                </div>
                            ) : (
                                <span className="text-sm sm:text-base font-black text-foreground">
                                    ₹{product.price.toLocaleString("en-IN")}
                                </span>
                            )}
                        </div>

                        {/* Flipkart-Style Action: Interactive ADD / Stepper */}
                        <div className="shrink-0">
                            {cartQty === 0 ? (
                                <Button
                                    size="sm"
                                    onClick={handleAddToCart}
                                    className="h-8 px-3 sm:px-4 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm active:scale-95 transition-all flex items-center gap-1 select-none"
                                    aria-label={`Add ${product.name} to cart`}
                                >
                                    <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                                    <span>ADD</span>
                                </Button>
                            ) : (
                                <div className="flex items-center border border-primary/30 rounded-lg h-8 bg-primary/10 text-primary select-none overflow-hidden shadow-sm">
                                    <button
                                        type="button"
                                        onClick={handleDecrease}
                                        className="w-7 h-full flex items-center justify-center hover:bg-primary/20 transition-colors active:scale-90"
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus className="h-3.5 w-3.5 stroke-[3]" />
                                    </button>
                                    <span className="min-w-6 text-center text-xs font-black px-1 text-primary">
                                        {cartQty}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleIncrease}
                                        className="w-7 h-full flex items-center justify-center hover:bg-primary/20 transition-colors active:scale-90"
                                        aria-label="Increase quantity"
                                    >
                                        <Plus className="h-3.5 w-3.5 stroke-[3]" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

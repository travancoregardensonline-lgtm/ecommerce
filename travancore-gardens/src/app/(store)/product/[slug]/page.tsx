"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, Truck, Droplets, Sun, ShoppingCart, Star, Loader2, AlertCircle, Heart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ProductGallery } from "@/components/store/ProductGallery";
import { RatingStars } from "@/components/store/RatingStars";
import { VariantSelector } from "@/components/store/VariantSelector";
import { QuantitySelector } from "@/components/store/QuantitySelector";
import { ReviewCard } from "@/components/store/ReviewCard";
import { useProduct } from "@/hooks/useSupabase";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { clsx } from "clsx";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();
    const { data: product, isLoading, error, refetch } = useProduct(slug);
    const addItem = useCartStore((s) => s.addItem);
    const wishlist = useWishlistStore();
    const { user } = useAuthStore();

    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Review form state
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewText, setReviewText] = useState("");
    const [reviewRating, setReviewRating] = useState(5);
    const [qty, setQty] = useState(1);

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center p-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground" />
                <h2 className="text-2xl font-bold">Product not found</h2>
                <p className="text-muted-foreground">This plant may have been removed or the link is incorrect.</p>
                <Button asChild>
                    <Link href="/shop">Browse All Plants</Link>
                </Button>
            </div>
        );
    }

    // Build images array from product_images
    const images: string[] = product.product_images
        ?.sort((a: any, b: any) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
        .map((img: any) => img.image_url) ?? [
        "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800",
    ];

    // Variants from product_variants
    const variants = product.product_variants ?? [];
    const sizeVariants = variants.filter((v: any) => v.variant_name);

    // Reviews
    const reviews = product.reviews ?? [];
    const avgRating = reviews.length
        ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length
        : 0;

    const price = product.price ?? 0;
    const salePrice = product.sale_price;
    const displayPrice = salePrice ?? price;
    const isOnSale = !!salePrice && salePrice < price;

    const isWishlisted = isClient ? wishlist.hasItem(product.id) : false;

    const toggleWishlist = () => {
        if (isWishlisted) {
            wishlist.removeItem(product.id);
            toast.info("Removed from wishlist");
        } else {
            wishlist.addItem({
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                salePrice: product.sale_price,
                imageUrl: images[0],
                category: product.categories?.name,
            });
            toast.success("Saved to wishlist");
        }
    };

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            product_id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            sale_price: product.sale_price,
            image_url: images[0],
            quantity: qty,
            weight: product.weight || 0.5,
        });
        toast.success(`${qty}x ${product.name} added to cart`, {
            action: {
                label: "View Cart",
                onClick: () => router.push("/cart"),
            },
        });
    };

    const handleBuyNow = () => {
        handleAddToCart();
        router.push("/checkout");
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error("Please log in to submit a review.");
            return;
        }

        setIsSubmittingReview(true);
        const supabase = createClient();

        try {
            const { error: reviewErr } = await supabase.from("reviews").insert({
                product_id: product.id,
                user_id: user.id,
                rating: reviewRating,
                review: reviewText.trim() || null,
            });

            if (reviewErr) throw reviewErr;

            toast.success("Review submitted successfully!");
            setReviewText("");
            setReviewRating(5);
            refetch();
        } catch (err: any) {
            toast.error(err.message || "Failed to submit review.");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-24 md:pb-12">
            {/* Breadcrumbs */}
            <nav className="flex text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8 flex-wrap items-center gap-1.5">
                <Link href="/" className="hover:text-foreground">Home</Link>
                <span>/</span>
                <Link href="/shop" className="hover:text-foreground">Shop</Link>
                {product.categories && (
                    <>
                        <span>/</span>
                        <Link href={`/shop?category=${product.categories.slug}`} className="hover:text-foreground truncate max-w-[150px]">
                            {product.categories.name}
                        </Link>
                    </>
                )}
                <span>/</span>
                <span className="text-foreground font-medium truncate max-w-[150px]">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
                {/* Product Images */}
                <ProductGallery images={images} alt={product.name} />

                {/* Product Details */}
                <div className="flex flex-col">
                    <div className="flex items-center justify-between gap-2 mb-2">
                        {product.categories && (
                            <Badge variant="secondary" className="w-fit text-xs font-semibold">
                                {product.categories.name}
                            </Badge>
                        )}
                        <button
                            type="button"
                            onClick={toggleWishlist}
                            className="p-2 rounded-full border border-border/80 hover:bg-muted transition-colors md:flex items-center gap-1.5 text-xs text-muted-foreground hidden"
                        >
                            <Heart className={clsx("h-4 w-4", isWishlisted ? "text-red-500 fill-red-500" : "")} />
                            <span>{isWishlisted ? "Saved" : "Save"}</span>
                        </button>
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-bold font-heading text-foreground mb-3">
                        {product.name}
                    </h1>

                    <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <RatingStars rating={Math.round(avgRating)} />
                        <span className="text-xs sm:text-sm text-primary font-medium">
                            {reviews.length} Review{reviews.length !== 1 ? "s" : ""}
                        </span>
                        {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
                            <span className="text-xs text-orange-600 font-semibold bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-full">
                                Only {product.stock} left!
                            </span>
                        )}
                        {product.stock === 0 && (
                            <Badge variant="destructive">Out of Stock</Badge>
                        )}
                    </div>

                    <div className="flex items-baseline gap-3 mb-6">
                        <span className="text-2xl sm:text-3xl font-black text-foreground">
                            ₹{displayPrice.toLocaleString("en-IN")}
                        </span>
                        {isOnSale && (
                            <span className="text-base sm:text-lg text-muted-foreground line-through font-medium">
                                ₹{price.toLocaleString("en-IN")}
                            </span>
                        )}
                        {isOnSale && (
                            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                                {Math.round(((price - salePrice!) / price) * 100)}% OFF
                            </Badge>
                        )}
                    </div>

                    {product.description && (
                        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6 sm:mb-8">
                            {product.description}
                        </p>
                    )}

                    <Separator className="mb-6" />

                    {/* Variants */}
                    {sizeVariants.length > 0 && (
                        <div className="mb-6">
                            <VariantSelector
                                title="Select Variant"
                                variants={sizeVariants.map((v: any) => ({
                                    id: v.id,
                                    name: v.variant_name,
                                    priceDelta: v.price ? v.price - price : undefined,
                                }))}
                                defaultSelectedId={sizeVariants[0]?.id}
                            />
                        </div>
                    )}

                    {/* Desktop & Inline Mobile Add to Cart & Buy Now */}
                    <div className="space-y-3 mb-8">
                        <div className="flex items-center gap-3">
                            <QuantitySelector defaultQuantity={1} onChange={setQty} />
                            <Button
                                size="lg"
                                variant="outline"
                                className="flex-1 h-11 sm:h-12 text-sm sm:text-base font-semibold border-primary/40 text-primary hover:bg-primary/10 active:scale-95 transition-all"
                                disabled={product.stock === 0}
                                onClick={handleAddToCart}
                            >
                                <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                Add to Cart
                            </Button>
                        </div>
                        <Button
                            size="lg"
                            className="w-full h-11 sm:h-12 text-sm sm:text-base font-bold shadow-md active:scale-95 transition-all"
                            disabled={product.stock === 0}
                            onClick={handleBuyNow}
                        >
                            <Zap className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                            {product.stock === 0 ? "Out of Stock" : "Buy Now with 1-Click"}
                        </Button>
                    </div>

                    {/* Care badges */}
                    <div className="grid grid-cols-2 gap-3 p-4 bg-muted/40 rounded-2xl border border-border/60">
                        {[
                            { icon: Sun, label: "Light", value: product.care_light ?? "Indirect Sunlight" },
                            { icon: Droplets, label: "Water", value: product.care_water ?? "Moderate Watering" },
                            { icon: Truck, label: "Delivery", value: "Pan-India Protective Transit" },
                            { icon: Leaf, label: "Quality", value: "Direct from Kerala Nursery" },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center gap-2.5">
                                <item.icon className="h-4 w-4 text-primary shrink-0" />
                                <span className="text-xs font-medium text-foreground">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile Sticky Product Action Dock */}
            <div
                aria-label="Mobile Product Actions"
                className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-xl border-t border-border/80 px-3 py-2.5 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]"
                style={{ paddingBottom: "max(0.6rem, env(safe-area-inset-bottom, 0px))" }}
            >
                <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
                    {/* Wishlist toggle */}
                    <button
                        type="button"
                        onClick={toggleWishlist}
                        className="p-2.5 rounded-xl border border-border/80 bg-muted/30 hover:bg-muted text-foreground flex items-center justify-center shrink-0 active:scale-90 transition-transform"
                        aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
                    >
                        <Heart className={clsx("h-5 w-5", isWishlisted ? "text-red-500 fill-red-500" : "text-muted-foreground")} />
                    </button>

                    <div className="flex flex-col min-w-0 pr-1">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total</span>
                        <span className="text-base font-black text-foreground truncate leading-none">
                            ₹{(displayPrice * qty).toLocaleString("en-IN")}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 flex-1 justify-end">
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-11 text-xs font-bold border-primary/40 text-primary hover:bg-primary/10 rounded-xl active:scale-95 px-2"
                            disabled={product.stock === 0}
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart className="h-3.5 w-3.5 mr-1 shrink-0" />
                            Add
                        </Button>
                        <Button
                            size="sm"
                            className="flex-1 h-11 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md rounded-xl active:scale-95 px-2"
                            disabled={product.stock === 0}
                            onClick={handleBuyNow}
                        >
                            <Zap className="h-3.5 w-3.5 mr-1 shrink-0" />
                            Buy Now
                        </Button>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-16 sm:mt-20">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                    <h2 className="text-2xl font-bold font-heading">Customer Reviews</h2>
                    {reviews.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold">{avgRating.toFixed(1)}</span>
                            <span className="text-muted-foreground text-sm">({reviews.length} reviews)</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">
                    <div className="md:col-span-4 lg:col-span-3">
                        <div className="bg-card border border-border/70 rounded-2xl p-5 sm:p-6 sticky top-24 shadow-sm">
                            <h3 className="font-semibold mb-4 text-base">Write a Review</h3>
                            {user ? (
                                <form onSubmit={handleSubmitReview} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-foreground">Rating</label>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    type="button"
                                                    key={star}
                                                    className="p-1 hover:scale-110 active:scale-95 transition-transform"
                                                    onClick={() => setReviewRating(star)}
                                                >
                                                    <Star
                                                        className={`h-6 w-6 ${
                                                            star <= reviewRating
                                                                ? "fill-yellow-400 text-yellow-400"
                                                                : "fill-muted text-muted"
                                                        }`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-foreground">Review (Optional)</label>
                                        <textarea
                                            value={reviewText}
                                            onChange={(e) => setReviewText(e.target.value)}
                                            placeholder="What did you think of this plant?"
                                            className="w-full h-24 rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-none"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full rounded-xl" disabled={isSubmittingReview}>
                                        {isSubmittingReview ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        {isSubmittingReview ? "Submitting..." : "Submit Review"}
                                    </Button>
                                </form>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-xs text-muted-foreground mb-3">
                                        You must be logged in to write a review.
                                    </p>
                                    <Button asChild variant="outline" size="sm" className="w-full rounded-xl">
                                        <Link href={`/login?redirect=/product/${product.slug}`}>Log In</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="md:col-span-8 lg:col-span-9">
                        {reviews.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground border rounded-2xl bg-card">
                                <Star className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                <p className="font-semibold text-foreground">No reviews yet</p>
                                <p className="text-xs sm:text-sm mt-1">Be the first to review this plant.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {reviews.map((review: any) => (
                                    <ReviewCard
                                        key={review.id}
                                        author={review.profiles?.name ?? "Verified Buyer"}
                                        date={new Date(review.created_at).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                        rating={review.rating}
                                        content={review.review ?? ""}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

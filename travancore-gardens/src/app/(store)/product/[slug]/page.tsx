"use client";

import { use } from "react";
import Link from "next/link";
import { ShieldCheck, Truck, Droplets, Sun, ShoppingCart, Star, Loader2, AlertCircle } from "lucide-react";
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
import { useAuthStore } from "@/store/authStore";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import Image from "next/image";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const { data: product, isLoading, error, refetch } = useProduct(slug);
    const addItem = useCartStore(s => s.addItem);
    const { user } = useAuthStore();

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
                <p className="text-muted-foreground">This product may have been removed or the link is incorrect.</p>
                <Button asChild><Link href="/shop">Browse All Plants</Link></Button>
            </div>
        );
    }

    // Build images array from product_images
    const images: string[] = product.product_images
        ?.sort((a: any, b: any) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
        .map((img: any) => img.image_url)
        ?? ["https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800"];

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
            weight: product.weight || 0.5
        });
        toast.success(`${qty} item${qty > 1 ? 's' : ''} added to cart`);
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
            refetch(); // Refresh product data to show new review
        } catch (err: any) {
            toast.error(err.message || "Failed to submit review.");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Breadcrumbs */}
            <nav className="flex text-sm text-muted-foreground mb-8 flex-wrap gap-1">
                <Link href="/" className="hover:text-foreground">Home</Link>
                <span>/</span>
                <Link href="/shop" className="hover:text-foreground">Shop</Link>
                {product.categories && (
                    <>
                        <span>/</span>
                        <Link href={`/shop?category=${product.categories.slug}`} className="hover:text-foreground">
                            {product.categories.name}
                        </Link>
                    </>
                )}
                <span>/</span>
                <span className="text-foreground font-medium">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
                {/* Product Images */}
                <ProductGallery images={images} alt={product.name} />

                {/* Product Details */}
                <div className="flex flex-col">
                    {product.categories && (
                        <Badge variant="secondary" className="w-fit mb-3">{product.categories.name}</Badge>
                    )}
                    <h1 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mb-3">
                        {product.name}
                    </h1>

                    <div className="flex items-center gap-4 mb-6">
                        <RatingStars rating={Math.round(avgRating)} />
                        <span className="text-sm text-primary font-medium cursor-pointer hover:underline">
                            {reviews.length} Review{reviews.length !== 1 ? "s" : ""}
                        </span>
                        {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
                            <span className="text-xs text-orange-500 font-semibold">Only {product.stock} left!</span>
                        )}
                        {product.stock === 0 && (
                            <Badge variant="destructive">Out of Stock</Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-3xl font-bold text-foreground">₹{displayPrice.toLocaleString("en-IN")}</span>
                        {isOnSale && (
                            <span className="text-lg text-muted-foreground line-through">₹{price.toLocaleString("en-IN")}</span>
                        )}
                        {isOnSale && (
                            <Badge className="bg-green-500 hover:bg-green-600">
                                {Math.round(((price - salePrice!) / price) * 100)}% OFF
                            </Badge>
                        )}
                    </div>

                    {product.description && (
                        <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>
                    )}

                    <Separator className="mb-8" />

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

                    {/* Add to Cart */}
                    <div className="flex gap-4 mb-8">
                        <QuantitySelector defaultQuantity={1} onChange={setQty} />
                        <Button
                            size="lg"
                            className="flex-1 h-12 text-base group"
                            disabled={product.stock === 0}
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart className="mr-2 h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
                            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                        </Button>
                    </div>

                    {/* Care badges */}
                    <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-xl">
                        {[
                            { icon: Sun, label: "Light", value: product.care_light ?? "Indirect Light" },
                            { icon: Droplets, label: "Water", value: product.care_water ?? "Moderate" },
                            { icon: Truck, label: "Delivery", value: "Free Shipping" },
                            { icon: ShieldCheck, label: "Guarantee", value: "30-Day Guarantee" },
                        ].map(item => (
                            <div key={item.label} className="flex items-center gap-2">
                                <item.icon className="h-4 w-4 text-primary shrink-0" />
                                <span className="text-xs font-medium">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reviews */}
            <div className="mt-20">
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

                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                    <div className="md:col-span-4 lg:col-span-3">
                        <div className="bg-muted/30 border rounded-xl p-6 sticky top-24">
                            <h3 className="font-semibold mb-4">Write a Review</h3>
                            {user ? (
                                <form onSubmit={handleSubmitReview} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">Rating</label>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    type="button"
                                                    key={star}
                                                    className="p-1 hover:scale-110 transition-transform"
                                                    onClick={() => setReviewRating(star)}
                                                >
                                                    <Star className={`h-6 w-6 ${star <= reviewRating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">Review (Optional)</label>
                                        <textarea
                                            value={reviewText}
                                            onChange={(e) => setReviewText(e.target.value)}
                                            placeholder="What did you think of this plant?"
                                            className="w-full h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isSubmittingReview}>
                                        {isSubmittingReview ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        {isSubmittingReview ? "Submitting..." : "Submit Review"}
                                    </Button>
                                </form>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-sm text-muted-foreground mb-4">You must be logged in to write a review.</p>
                                    <Button asChild variant="outline" className="w-full">
                                        <Link href={`/login?redirect=/product/${product.slug}`}>Log In</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="md:col-span-8 lg:col-span-9">
                        {reviews.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground border rounded-xl">
                                <Star className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                <p className="font-medium">No reviews yet</p>
                                <p className="text-sm">Be the first to review this product.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {reviews.map((review: any) => (
                                    <ReviewCard
                                        key={review.id}
                                        author={review.profiles?.name ?? "Verified Buyer"}
                                        date={new Date(review.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
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

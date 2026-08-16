"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Loader2, SlidersHorizontal, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ProductCard, Product } from "@/components/store/ProductCard";
import { useProducts, useCategories } from "@/hooks/useSupabase";

function ShopContent() {
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(searchParams.get("search") ?? "");
    const [sort, setSort] = useState<"newest" | "price_asc" | "price_desc">("newest");
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") ?? "");
    const [page, setPage] = useState(1);

    const { data: categoriesData } = useCategories();
    const { data, isLoading } = useProducts({ search, sort, category: selectedCategory || undefined, page, limit: 12 });

    const products: Product[] = (data?.products ?? []).map((p: any) => {
        const primaryImage = p.product_images?.find((img: any) => img.is_primary)?.image_url
            ?? p.product_images?.[0]?.image_url
            ?? "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=600";
        return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.price,
            salePrice: p.sale_price ?? undefined,
            imageUrl: primaryImage,
            category: p.categories?.name ?? "",
        };
    });

    const sortLabels: Record<string, string> = {
        newest: "Newest Arrivals",
        price_asc: "Price: Low to High",
        price_desc: "Price: High to Low",
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-8 border-b gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground font-heading">
                        {selectedCategory
                            ? (categoriesData as any[])?.find((c: any) => c.slug === selectedCategory)?.name ?? "Shop"
                            : "Shop All Plants"}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {isLoading ? "Loading…" : `${data?.total ?? 0} products found`}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search plants…"
                            className="pl-9 w-48 sm:w-64"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 shrink-0">
                                <SlidersHorizontal className="h-4 w-4" />
                                {sortLabels[sort]}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                            {Object.entries(sortLabels).map(([v, label]) => (
                                <DropdownMenuItem key={v} onClick={() => setSort(v as any)} className="justify-between">
                                    {label} {sort === v && <Check className="h-4 w-4 text-primary" />}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Mobile Categories */}
            <div className="md:hidden overflow-x-auto pb-4 mb-2 flex gap-2 hide-scrollbar">
                <Button 
                    variant={!selectedCategory ? "default" : "outline"}
                    size="sm"
                    className="shrink-0 rounded-full"
                    onClick={() => { setSelectedCategory(""); setPage(1); }}
                >
                    All Plants
                </Button>
                {((categoriesData as any[]) ?? []).map((cat: any) => (
                    <Button
                        key={cat.id}
                        variant={selectedCategory === cat.slug ? "default" : "outline"}
                        size="sm"
                        className="shrink-0 rounded-full"
                        onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                    >
                        {cat.name}
                    </Button>
                ))}
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar (Desktop) */}
                <aside className="hidden md:block w-56 flex-shrink-0">
                    <div className="space-y-4 sticky top-24">
                        <h3 className="font-semibold text-foreground">Categories</h3>
                        <ul className="space-y-1">
                            <li>
                                <button
                                    onClick={() => { setSelectedCategory(""); setPage(1); }}
                                    className={`text-sm w-full text-left px-2 py-1.5 rounded-md transition-colors font-medium ${!selectedCategory ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                                >
                                    All Plants
                                </button>
                            </li>
                            {((categoriesData as any[]) ?? []).map((cat: any) => (
                                <li key={cat.id}>
                                    <button
                                        onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                                        className={`text-sm w-full text-left px-2 py-1.5 rounded-md transition-colors ${selectedCategory === cat.slug ? "text-primary bg-primary/10 font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                                    >
                                        {cat.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                {/* Grid */}
                <div className="flex-1">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        </div>
                    ) : !products.length ? (
                        <div className="text-center py-24 text-muted-foreground">
                            <p className="text-lg font-medium">No products found</p>
                            <p className="text-sm mt-1">Try adjusting your search or filter</p>
                            <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setSelectedCategory(""); }}>
                                Clear Filters
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                                {products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                            {data && data.total > 12 && (
                                <div className="mt-12 flex justify-center gap-3">
                                    <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                                    <span className="flex items-center text-sm text-muted-foreground px-4">
                                        Page {page} of {Math.ceil(data.total / 12)}
                                    </span>
                                    <Button variant="outline" disabled={page >= Math.ceil(data.total / 12)} onClick={() => setPage(p => p + 1)}>Next</Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ShopPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        }>
            <ShopContent />
        </Suspense>
    );
}

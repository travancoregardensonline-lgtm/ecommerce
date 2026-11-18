"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, TrendingUp, Sparkles } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useSupabase";

interface SearchModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const popularSearches = [
    "Rose",
    "Flowering",
    "Mango",
    "Creeper",
    "Indoor",
    "Bonsai",
    "Fruit",
    "Hibiscus",
];

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const { data: categories } = useCategories();

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmed = query.trim();
        if (!trimmed) return;
        onOpenChange(false);
        router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
    };

    const handleTagClick = (tag: string) => {
        onOpenChange(false);
        router.push(`/shop?search=${encodeURIComponent(tag)}`);
    };

    const handleCategoryClick = (slug: string) => {
        onOpenChange(false);
        router.push(`/shop?category=${encodeURIComponent(slug)}`);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden top-[20%] translate-y-0 rounded-2xl border bg-background shadow-2xl">
                <DialogHeader className="p-4 pb-2 border-b">
                    <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Search className="h-4 w-4 text-primary" />
                        Search Plants &amp; Garden Supplies
                    </DialogTitle>
                </DialogHeader>

                <div className="p-4 space-y-5">
                    {/* Search Input Form */}
                    <form onSubmit={handleSearch} className="relative flex items-center">
                        <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search roses, flowering plants, fruit trees..."
                            className="pl-10 pr-20 h-12 text-sm bg-muted/40 rounded-xl border-input focus-visible:ring-1 focus-visible:ring-primary"
                            autoFocus
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery("")}
                                className="absolute right-12 p-1 text-muted-foreground hover:text-foreground"
                                aria-label="Clear search"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                        <Button
                            type="submit"
                            size="sm"
                            className="absolute right-1.5 h-9 px-3 rounded-lg text-xs font-semibold"
                            disabled={!query.trim()}
                        >
                            Search
                        </Button>
                    </form>

                    {/* Popular keywords */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <TrendingUp className="h-3.5 w-3.5 text-primary" />
                            <span>Popular Searches</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {popularSearches.map((term) => (
                                <button
                                    key={term}
                                    type="button"
                                    onClick={() => handleTagClick(term)}
                                    className="px-2.5 py-1 text-xs bg-muted/50 hover:bg-primary/10 hover:text-primary border border-border/60 rounded-full transition-colors font-medium text-foreground"
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Category Jump */}
                    {categories && (categories as any[]).length > 0 && (
                        <div className="space-y-2 pt-2 border-t">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <Sparkles className="h-3.5 w-3.5 text-primary" />
                                <span>Browse by Category</span>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                                {(categories as any[]).slice(0, 6).map((cat: any) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => handleCategoryClick(cat.slug || cat.name)}
                                        className="text-left px-3 py-2 text-xs rounded-lg bg-muted/30 hover:bg-muted font-medium text-foreground truncate transition-colors flex items-center justify-between group"
                                    >
                                        <span className="truncate">{cat.name}</span>
                                        <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">
                                            &rarr;
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

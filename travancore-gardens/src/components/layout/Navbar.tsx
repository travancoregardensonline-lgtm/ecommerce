"use client";

import Link from "next/link";
import { ShoppingCart, Search, User, Menu, X, Leaf } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { clsx } from "clsx";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Heart } from "lucide-react";

const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Plant Care", href: "/plant-care" },
    { name: "About", href: "/about" },
];

export function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const { items: cartItems, getTotalItems } = useCartStore();
    const { items: wishlistItems } = useWishlistStore();

    // Avoid SSR / client hydration mismatch — cart state lives in localStorage
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);

    useEffect(() => {
        setCartCount(getTotalItems());
        setWishlistCount(wishlistItems.length);
    }, [cartItems, wishlistItems, getTotalItems]);

    return (
        <header className="sticky top-0 z-50 w-full">
            {/* Announcement Bar */}
            <div className="bg-primary text-white py-2 text-[10px] font-black uppercase tracking-[0.25em] text-center hidden sm:block">
                Free shipping on orders over ₹999 | Use Code: GREENHOME for 10% Off
            </div>

            <nav className="w-full border-b bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl transition-all duration-300">
                <div className="container mx-auto px-4 sm:px-8 lg:px-12">
                    <div className="flex h-16 sm:h-20 items-center justify-between">
                        <div className="flex items-center">
                            <Link href="/" className="text-xl sm:text-2xl font-black tracking-tighter font-heading text-zinc-900 dark:text-white group flex items-center gap-2">
                                <Leaf className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform" />
                                Travancore <span className="text-primary italic font-medium font-serif lowercase">Gardens</span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:block">
                            <div className="flex items-baseline space-x-8">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={clsx(
                                            "text-sm font-medium transition-colors hover:text-primary",
                                            pathname === link.href ? "text-primary font-semibold" : "text-muted-foreground"
                                        )}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="hidden md:flex items-center space-x-4">
                            <Button variant="ghost" size="icon" aria-label="Search">
                                <Search className="h-5 w-5 text-foreground" />
                            </Button>
                            <Link href="/profile">
                                <Button variant="ghost" size="icon" aria-label="Profile">
                                    <User className="h-5 w-5 text-foreground" />
                                </Button>
                            </Link>
                            <Link href="/wishlist">
                                <Button variant="ghost" size="icon" aria-label="Wishlist" className="relative">
                                    <Heart className="h-5 w-5 text-foreground" />
                                    {wishlistCount > 0 && (
                                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                            {wishlistCount}
                                        </span>
                                    )}
                                </Button>
                            </Link>
                            <Link href="/cart">
                                <Button variant="ghost" size="icon" aria-label="Cart" className="relative">
                                    <ShoppingCart className="h-5 w-5 text-foreground" />
                                    {cartCount > 0 && (
                                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                            {cartCount}
                                        </span>
                                    )}
                                </Button>
                            </Link>
                        </div>

                        {/* Mobile menu button */}
                        <div className="-mr-2 flex md:hidden items-center space-x-2">
                            <Link href="/cart">
                                <Button variant="ghost" size="icon" aria-label="Cart" className="relative">
                                    <ShoppingCart className="h-5 w-5 text-foreground" />
                                    {cartCount > 0 && (
                                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                            {cartCount}
                                        </span>
                                    )}
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label="Menu"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-6 w-6 text-foreground" />
                                ) : (
                                    <Menu className="h-6 w-6 text-foreground" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t">
                        <div className="space-y-1 px-4 pb-3 pt-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={clsx(
                                        "block rounded-md px-3 py-2 text-base font-medium",
                                        pathname === link.href
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <Link
                                href="/profile"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                                Profile
                            </Link>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}

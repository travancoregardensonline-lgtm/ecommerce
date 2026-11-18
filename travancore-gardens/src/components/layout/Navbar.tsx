"use client";

import Link from "next/link";
import Image from "next/image";
import {
    ShoppingCart,
    Search,
    User,
    Menu,
    Heart,
    Home,
    LayoutGrid,
    Truck,
    Phone,
    Info,
    HelpCircle,
    ChevronRight,
    LogOut,
    Leaf,
    LogIn,
    Package,
} from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { useCategories } from "@/hooks/useSupabase";
import { authActions } from "@/lib/auth";
import { SearchModal } from "@/components/layout/SearchModal";

const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "About", href: "/about" },
    { name: "Track Order", href: "/track-order" },
];

export function Navbar() {
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const pathname = usePathname();
    const router = useRouter();

    const { items: cartItems, getTotalItems } = useCartStore();
    const { items: wishlistItems } = useWishlistStore();
    const { user, signOut } = useAuthStore();
    const { data: categories } = useCategories();

    // Avoid SSR hydration mismatch
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);

    useEffect(() => {
        setIsMounted(true);
        setCartCount(getTotalItems());
        setWishlistCount(wishlistItems.length);
    }, [cartItems, wishlistItems, getTotalItems]);

    // Close mobile drawer when pathname changes
    useEffect(() => {
        setIsMobileDrawerOpen(false);
    }, [pathname]);

    const handleSignOut = async () => {
        await authActions.signOut();
        signOut();
        setIsMobileDrawerOpen(false);
        router.push("/");
    };

    return (
        <>
            <header className="sticky top-0 z-40 w-full">
                <nav className="w-full border-b border-border/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl transition-all duration-300">
                    <div className="container mx-auto px-3 sm:px-6 lg:px-8">
                        <div className="flex h-16 sm:h-20 items-center justify-between gap-2">
                            {/* Left: Mobile Hamburger & Brand Logo */}
                            <div className="flex items-center gap-2 sm:gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsMobileDrawerOpen(true)}
                                    aria-label="Open Navigation Menu"
                                    className="md:hidden h-10 w-10 text-foreground hover:bg-muted"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>

                                <Link
                                    href="/"
                                    className="flex items-center gap-2 group tracking-tight"
                                    aria-label="Travancore Gardens Home"
                                >
                                    <Image
                                        src="/logo.png"
                                        alt="Travancore Gardens Logo"
                                        width={38}
                                        height={38}
                                        className="h-8 w-8 sm:h-9 sm:w-9 object-contain group-hover:scale-105 transition-transform"
                                        priority
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-base sm:text-xl font-black font-heading text-zinc-900 dark:text-white leading-none">
                                            Travancore{" "}
                                            <span className="text-primary italic font-serif font-medium lowercase">
                                                Gardens
                                            </span>
                                        </span>
                                        <span className="hidden sm:block text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                            Botanical Nursery &amp; Plants
                                        </span>
                                    </div>
                                </Link>
                            </div>

                            {/* Desktop Navigation Links */}
                            <div className="hidden md:flex items-center space-x-7">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={cn(
                                            "text-sm font-medium transition-colors hover:text-primary",
                                            pathname === link.href
                                                ? "text-primary font-semibold"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>

                            {/* Right Action Icons (Both Mobile & Desktop) */}
                            <div className="flex items-center space-x-1 sm:space-x-2">
                                {/* Search Button */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsSearchOpen(true)}
                                    aria-label="Search Plants"
                                    className="h-9 w-9 sm:h-10 sm:w-10 text-foreground hover:text-primary"
                                >
                                    <Search className="h-5 w-5" />
                                </Button>

                                {/* Wishlist Button */}
                                <Link href="/wishlist">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Wishlist"
                                        className="relative h-9 w-9 sm:h-10 sm:w-10 text-foreground hover:text-primary"
                                    >
                                        <Heart className="h-5 w-5" />
                                        {isMounted && wishlistCount > 0 && (
                                            <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground border-2 border-white dark:border-zinc-950">
                                                {wishlistCount > 99 ? "99+" : wishlistCount}
                                            </span>
                                        )}
                                    </Button>
                                </Link>

                                {/* Desktop User Profile */}
                                <Link href={user ? "/profile" : "/login"} className="hidden md:inline-flex">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label={user ? "Profile" : "Sign In"}
                                        className="h-9 w-9 sm:h-10 sm:w-10 text-foreground hover:text-primary"
                                    >
                                        <User className="h-5 w-5" />
                                    </Button>
                                </Link>

                                {/* Cart Button */}
                                <Link href="/cart">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Cart"
                                        className="relative h-9 w-9 sm:h-10 sm:w-10 text-foreground hover:text-primary"
                                    >
                                        <ShoppingCart className="h-5 w-5" />
                                        {isMounted && cartCount > 0 && (
                                            <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground border-2 border-white dark:border-zinc-950">
                                                {cartCount > 99 ? "99+" : cartCount}
                                            </span>
                                        )}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Mobile Navigation Drawer (Sheet) */}
            <Sheet open={isMobileDrawerOpen} onOpenChange={setIsMobileDrawerOpen}>
                <SheetContent
                    side="left"
                    className="w-[85vw] max-w-sm p-0 flex flex-col h-full bg-background border-r"
                >
                    <SheetHeader className="p-4 border-b flex flex-row items-center justify-between text-left">
                        <SheetTitle className="flex items-center gap-2">
                            <Image
                                src="/logo.png"
                                alt="Travancore Gardens"
                                width={32}
                                height={32}
                                className="h-7 w-7 object-contain"
                            />
                            <div>
                                <p className="font-heading font-black text-sm text-foreground leading-none">
                                    Travancore <span className="text-primary italic font-serif">Gardens</span>
                                </p>
                                <p className="text-[10px] text-muted-foreground font-medium">Nursery &amp; Botanicals</p>
                            </div>
                        </SheetTitle>
                    </SheetHeader>

                    {/* Scrollable Drawer Body */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                        {/* Account Banner */}
                        <div className="rounded-xl bg-muted/40 border border-border/80 p-3.5">
                            {user ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5 overflow-hidden">
                                        <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-semibold text-xs uppercase">
                                            {user.email?.charAt(0) || "U"}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-foreground truncate">
                                                {user.email}
                                            </p>
                                            <Link
                                                href="/profile"
                                                onClick={() => setIsMobileDrawerOpen(false)}
                                                className="text-[11px] text-primary hover:underline font-medium"
                                            >
                                                My Account &amp; Orders &rarr;
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between gap-2">
                                    <div>
                                        <p className="text-xs font-semibold text-foreground">Welcome to our store!</p>
                                        <p className="text-[11px] text-muted-foreground">Log in to track orders &amp; wishlist</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        asChild
                                        className="h-8 text-xs font-semibold shrink-0"
                                    >
                                        <Link href="/login" onClick={() => setIsMobileDrawerOpen(false)}>
                                            <LogIn className="h-3.5 w-3.5 mr-1" /> Sign In
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Search trigger inside drawer */}
                        <button
                            type="button"
                            onClick={() => {
                                setIsMobileDrawerOpen(false);
                                setIsSearchOpen(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-border/80 bg-muted/20 text-muted-foreground text-xs font-medium hover:bg-muted/40 transition-colors"
                        >
                            <Search className="h-4 w-4 text-primary shrink-0" />
                            <span>Search roses, indoor plants...</span>
                        </button>

                        {/* Primary Navigation Links */}
                        <div className="space-y-1">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-2">
                                Menu
                            </p>
                            {[
                                { name: "Home", href: "/", icon: Home },
                                { name: "Shop All Plants", href: "/shop", icon: LayoutGrid },
                                {
                                    name: "My Wishlist",
                                    href: "/wishlist",
                                    icon: Heart,
                                    badge: wishlistCount > 0 ? wishlistCount : null,
                                },
                                {
                                    name: "Shopping Cart",
                                    href: "/cart",
                                    icon: ShoppingCart,
                                    badge: cartCount > 0 ? cartCount : null,
                                },
                                { name: "Track Your Order", href: "/track-order", icon: Truck },
                            ].map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsMobileDrawerOpen(false)}
                                        className={cn(
                                            "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-primary/10 text-primary font-semibold"
                                                : "text-foreground hover:bg-muted"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                                            <span>{item.name}</span>
                                        </div>
                                        {item.badge !== null && item.badge !== undefined && (
                                            <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[11px] font-bold">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Categories Section */}
                        {categories && (categories as any[]).length > 0 && (
                            <div className="space-y-1 pt-3 border-t">
                                <div className="flex items-center justify-between px-2 mb-2">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Plant Categories
                                    </p>
                                    <Link
                                        href="/shop"
                                        onClick={() => setIsMobileDrawerOpen(false)}
                                        className="text-[11px] text-primary font-medium hover:underline"
                                    >
                                        View All
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 gap-1">
                                    {(categories as any[]).slice(0, 7).map((cat: any) => (
                                        <Link
                                            key={cat.id}
                                            href={`/shop?category=${encodeURIComponent(cat.slug || cat.name)}`}
                                            onClick={() => setIsMobileDrawerOpen(false)}
                                            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors"
                                        >
                                            <div className="flex items-center gap-2.5 truncate">
                                                <Leaf className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                                                <span className="truncate">{cat.name}</span>
                                            </div>
                                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Customer Support & Information */}
                        <div className="space-y-1 pt-3 border-t">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-2">
                                Help &amp; Support
                            </p>
                            {[
                                { name: "About Travancore Gardens", href: "/about", icon: Info },
                                { name: "Contact & Nursery Location", href: "/contact", icon: Phone },
                                { name: "Frequently Asked Questions", href: "/faq", icon: HelpCircle },
                                { name: "Shipping & Delivery Policy", href: "/shipping-policy", icon: Package },
                                { name: "Cancellation & Refund", href: "/refund-policy", icon: Leaf },
                            ].map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsMobileDrawerOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                    >
                                        <Icon className="h-3.5 w-3.5 shrink-0" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Direct Nursery Support Card */}
                        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs space-y-1.5">
                            <p className="font-semibold text-primary flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5" /> Need Assistance?
                            </p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Our nursery experts are here to help with plant selection and shipping queries.
                            </p>
                            <a
                                href="https://wa.me/918590809000"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block text-xs font-bold text-primary hover:underline pt-0.5"
                            >
                                WhatsApp Chat Support &rarr;
                            </a>
                        </div>
                    </div>

                    {/* Drawer Footer */}
                    {user && (
                        <div className="p-4 border-t bg-muted/20">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSignOut}
                                className="w-full text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 gap-2"
                            >
                                <LogOut className="h-3.5 w-3.5" /> Sign Out
                            </Button>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Instant Search Modal */}
            <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
        </>
    );
}

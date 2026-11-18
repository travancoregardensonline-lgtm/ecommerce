"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Heart, ShoppingCart, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const pathname = usePathname();
    const { items: cartItems, getTotalItems } = useCartStore();
    const { items: wishlistItems } = useWishlistStore();
    const { user } = useAuthStore();

    const [isMounted, setIsMounted] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);

    useEffect(() => {
        setIsMounted(true);
        setCartCount(getTotalItems());
        setWishlistCount(wishlistItems.length);
    }, [cartItems, wishlistItems, getTotalItems]);

    // Product pages have their dedicated Action Dock (Add to Cart / Buy Now)
    // Checkout page has an enclosed, distraction-free payment flow
    if (pathname.startsWith("/product/") || pathname === "/checkout") {
        return null;
    }

    // Check active routes
    const isHomeActive = pathname === "/";
    const isShopActive = pathname.startsWith("/shop");
    const isWishlistActive = pathname === "/wishlist";
    const isCartActive = pathname === "/cart";
    const isProfileActive = pathname.startsWith("/profile") || pathname === "/login";

    const navTabs = [
        {
            name: "Home",
            href: "/",
            icon: Home,
            isActive: isHomeActive,
            badge: null,
            ariaLabel: "Go to Home",
        },
        {
            name: "Shop",
            href: "/shop",
            icon: LayoutGrid,
            isActive: isShopActive,
            badge: null,
            ariaLabel: "Browse Plants and Categories",
        },
        {
            name: "Wishlist",
            href: "/wishlist",
            icon: Heart,
            isActive: isWishlistActive,
            badge: isMounted && wishlistCount > 0 ? (wishlistCount > 99 ? "99+" : wishlistCount) : null,
            ariaLabel: `Wishlist with ${wishlistCount} items`,
        },
        {
            name: "Cart",
            href: "/cart",
            icon: ShoppingCart,
            isActive: isCartActive,
            badge: isMounted && cartCount > 0 ? (cartCount > 99 ? "99+" : cartCount) : null,
            ariaLabel: `Cart with ${cartCount} items`,
        },
        {
            name: user ? "Profile" : "Account",
            href: user ? "/profile" : "/login",
            icon: User,
            isActive: isProfileActive,
            badge: null,
            ariaLabel: user ? "View Profile and Orders" : "Sign In to Account",
        },
    ];

    return (
        <aside
            aria-label="Mobile Bottom Navigation"
            className="fixed bottom-0 left-0 right-0 z-40 block md:hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-border/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
            style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom, 0px))" }}
        >
            <nav className="flex items-center justify-around h-15 max-w-lg mx-auto px-2">
                {navTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            aria-label={tab.ariaLabel}
                            className={cn(
                                "relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-200 active:scale-95 group",
                                tab.isActive
                                    ? "text-primary font-semibold"
                                    : "text-muted-foreground hover:text-foreground font-medium"
                            )}
                        >
                            {/* Top active indicator line */}
                            {tab.isActive && (
                                <span
                                    className="absolute -top-1.5 w-7 h-0.75 bg-primary rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(46,94,62,0.5)]"
                                    aria-hidden="true"
                                />
                            )}

                            {/* Icon with badge */}
                            <div className="relative flex items-center justify-center">
                                <Icon
                                    className={cn(
                                        "h-5 w-5 transition-transform duration-200",
                                        tab.isActive ? "scale-110 stroke-[2.4]" : "stroke-[1.8] group-hover:scale-105"
                                    )}
                                />
                                {tab.badge !== null && (
                                    <span
                                        className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground border-2 border-white dark:border-zinc-950 shadow-sm animate-in zoom-in-50 duration-200"
                                        aria-hidden="true"
                                    >
                                        {tab.badge}
                                    </span>
                                )}
                            </div>

                            {/* Label */}
                            <span
                                className={cn(
                                    "text-[11px] tracking-tight mt-1 transition-colors leading-none",
                                    tab.isActive ? "text-primary font-semibold" : "text-muted-foreground"
                                )}
                            >
                                {tab.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}

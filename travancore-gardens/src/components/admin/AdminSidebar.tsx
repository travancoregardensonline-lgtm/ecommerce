"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Box,
    Tags,
    Image as ImageIcon,
    Settings,
    Leaf,
    Truck,
    FileText,
    Tag,
    BarChart3,
    Newspaper,
    Package
} from "lucide-react";

const sidebarGroups = [
    {
        label: "Overview",
        links: [
            { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
            { name: "Reports", href: "/admin/reports", icon: BarChart3 },
        ]
    },
    {
        label: "Catalogue",
        links: [
            { name: "Products", href: "/admin/products", icon: Box },
            { name: "Categories", href: "/admin/categories", icon: Tags },
            { name: "Inventory", href: "/admin/inventory", icon: Package },
            { name: "Media Library", href: "/admin/media", icon: ImageIcon },
        ]
    },
    {
        label: "Sales",
        links: [
            { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
            { name: "Bulk Processing", href: "/admin/orders/bulk", icon: FileText },
            { name: "Customers", href: "/admin/customers", icon: Users },
            { name: "Coupons", href: "/admin/coupons", icon: Tag },
            { name: "Shiprocket", href: "/admin/shiprocket", icon: Truck },
        ]
    },
    {
        label: "Content & Config",
        links: [
            { name: "Banners", href: "/admin/banners", icon: ImageIcon },
            { name: "Blog CMS", href: "/admin/blog", icon: Newspaper },
            { name: "Shipping", href: "/admin/shipping", icon: Truck },
            { name: "Settings", href: "/admin/settings", icon: Settings },
        ]
    },
];

import { useAuthStore } from "@/store/authStore";
import { authActions } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function AdminSidebar() {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const router = useRouter();

    const handleSignOut = async () => {
        await authActions.signOut();
        router.push("/admin/login");
        router.refresh();
    };

    return (
        <aside className="w-64 bg-sidebar border-r flex flex-col h-full overflow-y-auto z-10 transition-transform">
            <div className="h-16 flex items-center px-6 border-b shrink-0">
                <Link href="/admin/dashboard" className="flex items-center space-x-2 text-sidebar-primary">
                    <Leaf className="h-6 w-6" />
                    <span className="text-xl font-bold font-heading">TG Admin</span>
                </Link>
            </div>
            <div className="flex-1 py-4 px-4 space-y-4 overflow-y-auto">
                {sidebarGroups.map((group) => (
                    <div key={group.label}>
                        <div className="mb-1.5 px-2 text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-wider">
                            {group.label}
                        </div>
                        <ul className="space-y-0.5">
                            {group.links.map((link) => {
                                const isActive = pathname === link.href || (link.href !== "/admin/dashboard" && pathname.startsWith(link.href));
                                const Icon = link.icon;
                                return (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className={clsx(
                                                "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                                isActive
                                                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                                            )}
                                        >
                                            <Icon className="h-4 w-4 shrink-0" />
                                            <span>{link.name}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>
            <div className="px-4 py-4 border-t shrink-0 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-3 px-2 overflow-hidden">
                    <div className="h-8 w-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                        {user?.email?.[0].toUpperCase() ?? "A"}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-xs font-medium text-sidebar-foreground truncate">Admin</span>
                        <span className="text-[10px] text-sidebar-foreground/60 truncate">{user?.email ?? "admin@travancore.com"}</span>
                    </div>
                </div>
                <button
                    onClick={handleSignOut}
                    className="p-2 text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                    title="Sign Out"
                >
                    <LogOut className="h-4 w-4" />
                </button>
            </div>
        </aside>
    );
}

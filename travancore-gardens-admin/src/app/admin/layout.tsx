"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { clsx } from "clsx";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Admin login page has its own full-page layout — no sidebar/topbar
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-muted/20">
            {/* Mobile sidebar backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Desktop static, Mobile absolute */}
            <div className={clsx(
                "fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:block",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <AdminSidebar />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden relative">
                <AdminTopbar onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

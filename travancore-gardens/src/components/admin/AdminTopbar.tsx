"use client";

import { Bell, Search, Menu, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AdminTopbar({ onMenuClick }: { onMenuClick?: () => void }) {
    const router = useRouter();
    const { user } = useAuthStore();

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/admin/login");
        router.refresh();
    };

    return (
        <header className="h-16 shrink-0 bg-background border-b flex items-center justify-between px-4 lg:px-8 z-10 sticky top-0">
            <div className="flex items-center space-x-4 flex-1">
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
                    <Menu className="h-5 w-5 text-foreground" />
                    <span className="sr-only">Toggle Sidebar</span>
                </Button>
                <div className="relative w-full max-w-sm hidden sm:block font-sans">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search products, orders, customers..."
                        className="w-full pl-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:bg-background h-9 text-sm"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-foreground" />
                    <span className="absolute top-1 right-1 flex h-2.5 w-2.5 rounded-full bg-destructive" />
                </Button>

                {/* Admin user menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 h-9 px-3">
                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm font-medium hidden sm:block max-w-[120px] truncate">
                                {user?.email?.split("@")[0] ?? "Admin"}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuLabel>
                            <p className="font-semibold text-sm">Admin Panel</p>
                            <p className="font-normal text-xs text-muted-foreground truncate">{user?.email}</p>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleSignOut}
                            className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer gap-2"
                        >
                            <LogOut className="h-4 w-4" /> Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}

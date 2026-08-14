"use client";

import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { syncCartAndWishlistOnLogin } from "@/lib/sync";
import { useEffect } from "react";

/**
 * AuthProvider syncs Supabase auth state with the Zustand auth store.
 * Mount this once at the root layout level.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setSession, setIsLoading } = useAuthStore();

    useEffect(() => {
        const supabase = createClient();

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setIsLoading(false);
            if (session?.user) {
                syncCartAndWishlistOnLogin(session.user.id);
            }
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            setIsLoading(false);
            
            if (event === 'SIGNED_IN' && session?.user) {
                syncCartAndWishlistOnLogin(session.user.id);
            } else if (event === 'SIGNED_OUT') {
                useCartStore.getState().setCartId(null);
                useWishlistStore.getState().setWishlistId(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [setSession, setIsLoading]);

    return <>{children}</>;
}

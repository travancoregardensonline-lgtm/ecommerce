"use client";

import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
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
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [setSession, setIsLoading]);

    return <>{children}</>;
}

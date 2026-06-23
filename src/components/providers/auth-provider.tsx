"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { createClient } from "@/lib/supabase/client";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize, initialized, setUser, refreshProfile } = useAuthStore();
  const initRef = useRef(false);

  useEffect(() => {
    if (!initRef.current && !initialized) {
      initRef.current = true;
      initialize();
    }
  }, [initialize, initialized]);

  useEffect(() => {
    const supabase = createClient();
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setUser(session?.user ?? null);
        if (session?.user) await refreshProfile();
      }
      if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => data.subscription.unsubscribe();
  }, [setUser, refreshProfile]);

  return <>{children}</>;
}

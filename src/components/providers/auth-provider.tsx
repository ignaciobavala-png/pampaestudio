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
    // OJO: el callback NO debe ser async ni await-ear llamadas de Supabase.
    // Corre con el lock de auth (Navigator LockManager) tomado; si adentro
    // llamás otra operación que necesita ese lock (getSession dentro del
    // select de refreshProfile) se produce un deadlock que cuelga
    // signInWithPassword. Por eso el fetch del profile se difiere con
    // setTimeout(…, 0), para ejecutarse una vez liberado el lock.
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setUser(session?.user ?? null);
        if (session?.user) setTimeout(() => { refreshProfile(); }, 0);
      }
      if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => data.subscription.unsubscribe();
  }, [setUser, refreshProfile]);

  return <>{children}</>;
}

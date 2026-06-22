"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/store/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize, initialized } = useAuthStore();
  const initRef = useRef(false);

  useEffect(() => {
    if (!initRef.current && !initialized) {
      initRef.current = true;
      initialize();
    }
  }, [initialize, initialized]);

  return <>{children}</>;
}

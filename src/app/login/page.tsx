"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const isAdminLogin = next === "/admin";
  const { signIn, signInWithGoogle, signUp, user, profile } = useAuthStore();
  const [mode, setMode] = useState<"login" | "register">(isAdminLogin ? "login" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && profile) {
      const dest = profile.role === "admin" ? "/admin" : next;
      router.replace(dest);
    }
  }, [user, profile, router, next]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "register") {
      const { error: err } = await signUp(email, password, fullName);
      if (err) {
        setError(err);
        setLoading(false);
      } else {
        setError(null);
        setLoading(false);
        setMode("login");
      }
    } else {
      const { error: err } = await signIn(email, password);
      if (err) {
        setError(err);
        setLoading(false);
      } else {
        const { profile: p } = useAuthStore.getState();
        const dest = p?.role === "admin" ? "/admin" : next;
        router.replace(dest);
      }
    }
  };

  return (
    <AppShell>
      <div className="flex min-h-[80vh] items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-5">
          <div>
            <h1 className="font-serif text-[28px] tracking-[-0.02em]">
              {isAdminLogin
                ? "Acceso administrador"
                : mode === "login"
                  ? "Entrá a Pampa"
                  : "Creá tu cuenta"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              {isAdminLogin
                ? "Solo cuentas con rol de administrador."
                : mode === "login"
                  ? "Reservá tu lugar y gestioná tus clases desde acá."
                  : "Registrate para empezar a reservar clases."}
            </p>
          </div>

          {!isAdminLogin && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(null); }}
              className={`flex-1 cursor-pointer rounded-[11px] border px-3 py-[9px] text-[13px] font-medium transition-all ${
                mode === "login"
                  ? "border-foreground bg-foreground text-white"
                  : "border-[rgba(26,25,31,.14)] bg-transparent text-muted-foreground hover:border-ink-dim"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setError(null); }}
              className={`flex-1 cursor-pointer rounded-[11px] border px-3 py-[9px] text-[13px] font-medium transition-all ${
                mode === "register"
                  ? "border-foreground bg-foreground text-white"
                  : "border-[rgba(26,25,31,.14)] bg-transparent text-muted-foreground hover:border-ink-dim"
              }`}
            >
              Registrarme
            </button>
          </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "register" && !isAdminLogin && (
              <input
                className="w-full rounded-[12px] border border-[rgba(26,25,31,.14)] bg-muted px-[14px] py-[13px] text-sm text-foreground outline-none transition-colors placeholder:text-ink-dim focus:border-primary focus:bg-card"
                type="text"
                placeholder="Nombre completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
              />
            )}

            <input
              className="w-full rounded-[12px] border border-[rgba(26,25,31,.14)] bg-muted px-[14px] py-[13px] text-sm text-foreground outline-none transition-colors placeholder:text-ink-dim focus:border-primary focus:bg-card"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <input
              className="w-full rounded-[12px] border border-[rgba(26,25,31,.14)] bg-muted px-[14px] py-[13px] text-sm text-foreground outline-none transition-colors placeholder:text-ink-dim focus:border-primary focus:bg-card"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />

            {error && (
              <p className="rounded-[10px] bg-[#FDE8E8] px-3 py-2 text-[12px] text-[#C0392B]">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-auto w-full rounded-[13px] py-[14px] text-sm font-semibold"
            >
              {loading ? "Cargando..." : mode === "login" ? "Entrar" : "Crear cuenta"}
            </Button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] text-ink-dim">o</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[13px] border border-[rgba(26,25,31,.14)] bg-card py-[13px] text-sm font-medium transition-colors hover:bg-muted"
            >
              <svg className="size-[18px]" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google
            </button>
          </form>

          <p className="text-center text-[11px] text-ink-dim leading-relaxed">
            Al continuar aceptás los términos de uso.
          </p>
          <div className="text-center">
            <Link href="/admin" className="inline-block text-xs text-ink-dim underline-offset-2 hover:text-foreground transition-colors">
              Acceso admin →
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-muted-foreground">Cargando...</div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

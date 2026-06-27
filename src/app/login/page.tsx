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
  const { signIn, signUp, user, profile } = useAuthStore();
  const [mode, setMode] = useState<"login" | "register">(isAdminLogin ? "login" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

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
        setLoading(false);
        setRegistered(true);
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

          {registered && (
            <div className="rounded-[10px] bg-[#E8F5E9] px-3 py-2.5 text-[12px] text-[#2E7D32] leading-relaxed">
              ✓ Cuenta creada. Ya podés iniciar sesión.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3" onChange={() => setRegistered(false)}>
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

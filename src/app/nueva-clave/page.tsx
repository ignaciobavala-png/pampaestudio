"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function NuevaClavePage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (err) {
      // El caso típico: se entró directo a /nueva-clave sin venir del mail,
      // así que no hay sesión de recovery abierta.
      setError(
        err.message === "Auth session missing!"
          ? "El link expiró o ya se usó. Pedí uno nuevo."
          : err.message
      );
      return;
    }

    setDone(true);
    setTimeout(() => router.replace("/"), 1500);
  };

  return (
    <AppShell>
      <div className="flex min-h-[80vh] items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-5">
          <div>
            <h1 className="font-serif text-[28px] tracking-[-0.02em]">
              Nueva contraseña
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              Elegí una contraseña de al menos 6 caracteres.
            </p>
          </div>

          {done ? (
            <div className="rounded-[10px] bg-[#E8F5E9] px-3 py-2.5 text-[12px] text-[#2E7D32] leading-relaxed">
              ✓ Listo, tu contraseña quedó actualizada.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                className="w-full rounded-[12px] border border-[rgba(26,25,31,.14)] bg-muted px-[14px] py-[13px] text-sm text-foreground outline-none transition-colors placeholder:text-ink-dim focus:border-primary focus:bg-card"
                type="password"
                placeholder="Contraseña nueva"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />

              <input
                className="w-full rounded-[12px] border border-[rgba(26,25,31,.14)] bg-muted px-[14px] py-[13px] text-sm text-foreground outline-none transition-colors placeholder:text-ink-dim focus:border-primary focus:bg-card"
                type="password"
                placeholder="Repetir contraseña"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
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
                {loading ? "Guardando..." : "Guardar contraseña"}
              </Button>

              <div className="text-center">
                <Link
                  href="/recuperar"
                  className="inline-block text-[13px] text-muted-foreground underline-offset-2 hover:text-foreground transition-colors"
                >
                  Pedir un link nuevo
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </AppShell>
  );
}

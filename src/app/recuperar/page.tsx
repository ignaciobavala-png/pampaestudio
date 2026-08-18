"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    // El resultado se ignora a propósito: la respuesta tiene que ser idéntica
    // exista o no la cuenta, si no el formulario sirve para enumerar usuarias.
    await supabase.auth
      .resetPasswordForEmail(email.trim(), {
        redirectTo: `${location.origin}/auth/confirm`,
      })
      .catch(() => {});

    setLoading(false);
    setSent(true);
  };

  return (
    <AppShell>
      <div className="flex min-h-[80vh] items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-5">
          <div>
            <h1 className="font-serif text-[28px] tracking-[-0.02em]">
              Recuperar contraseña
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              Te mandamos un link para elegir una contraseña nueva.
            </p>
          </div>

          {sent ? (
            <div className="space-y-4">
              <div className="rounded-[10px] bg-[#E8F5E9] px-3 py-2.5 text-[12px] text-[#2E7D32] leading-relaxed">
                ✓ Si hay una cuenta con ese email, te llega un link en unos
                minutos. Revisá también la carpeta de spam.
              </div>
              <Link
                href="/login"
                className="block text-center text-[13px] text-muted-foreground underline-offset-2 hover:text-foreground transition-colors"
              >
                Volver a iniciar sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                className="w-full rounded-[12px] border border-[rgba(26,25,31,.14)] bg-muted px-[14px] py-[13px] text-sm text-foreground outline-none transition-colors placeholder:text-ink-dim focus:border-primary focus:bg-card"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <Button
                type="submit"
                disabled={loading}
                className="h-auto w-full rounded-[13px] py-[14px] text-sm font-semibold"
              >
                {loading ? "Enviando..." : "Enviar link"}
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-block text-[13px] text-muted-foreground underline-offset-2 hover:text-foreground transition-colors"
                >
                  Volver a iniciar sesión
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </AppShell>
  );
}

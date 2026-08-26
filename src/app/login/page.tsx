"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";
import Link from "next/link";

// Los mensajes de GoTrue vienen en inglés y el más frecuente ("Invalid login
// credentials") también tapa el caso de la cuenta sin confirmar, que es el que
// más consultas genera.
function traducirErrorAuth(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("email not confirmed")) {
    return "Todavía no confirmaste tu mail. Buscá el mail de Pampa Estudio (revisá spam) y abrí el link.";
  }
  if (m.includes("invalid login credentials")) {
    // GoTrue no distingue mail inexistente de contraseña mal puesta, y está
    // bien que no lo haga: decirlo filtraría qué direcciones tienen cuenta.
    return "Contraseña incorrecta. Revisá el mail y la contraseña e intentá de nuevo.";
  }
  if (m.includes("rate limit") || m.includes("too many requests")) {
    return "Demasiados intentos. Esperá unos minutos y probá de nuevo.";
  }
  if (m.includes("error sending confirmation") || m.includes("error sending")) {
    return "No pudimos enviar el mail de confirmación. Escribinos y te damos de alta a mano.";
  }
  if (m.includes("password should be at least")) {
    return "La contraseña tiene que tener al menos 6 caracteres.";
  }
  if (m.includes("user already registered")) {
    return "Ese mail ya tiene una cuenta. Iniciá sesión, o usá \"Olvidé mi contraseña\".";
  }
  // 500 de GoTrue: se cae la conexión a la base y el login falla sin que la
  // contraseña tenga nada que ver. Pasó el 25-ago 23:48 dos veces seguidas.
  // Sin esta rama se mostraba el texto crudo en inglés.
  if (
    m.includes("unexpected_failure") ||
    m.includes("unhandled server error") ||
    m.includes("database error") ||
    m.includes("error finding user")
  ) {
    return "Se cayó el servidor un momento. Esperá unos segundos y probá de nuevo — no es tu contraseña.";
  }
  return msg;
}

// Las cookies de sesión de @supabase/ssr: `sb-<ref>-auth-token`, partida en
// `.0`, `.1` cuando el JWT no entra en una sola. Devolvemos nombre+valor de
// todas para poder detectar que *cambiaron*, no solo que existen.
function authCookieSnapshot(): string {
  return document.cookie
    .split(";")
    .map((c) => c.trim())
    .filter((c) => /^sb-.*auth-token(\.\d+)?=/.test(c))
    .sort()
    .join("|");
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const isAdminLogin = next === "/admin";
  const errorParam = searchParams.get("error");
  const { signIn, signUp, user, profile } = useAuthStore();
  const [mode, setMode] = useState<"login" | "register">(isAdminLogin ? "login" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(
    errorParam === "link_vencido"
      ? "Ese link ya se usó o venció. Pedí uno nuevo."
      : errorParam === "link_invalido"
        ? "El link no es válido. Pedí uno nuevo."
        : null
  );
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Redirigimos apenas hay sesión (user), sin esperar el profile: en prod
  // el fetch del profile puede colgarse (lock de @supabase/ssr) y no debe
  // bloquear el redirect. El rol se revalida server-side en el middleware.
  useEffect(() => {
    if (user) {
      const dest = profile?.role === "admin" || isAdminLogin ? "/admin" : next;
      router.replace(dest);
    }
  }, [user, profile, router, next, isAdminLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "register") {
      const { error: err, needsConfirmation, alreadyRegistered } = await signUp(
        email,
        password,
        fullName
      );
      setLoading(false);

      if (err) {
        setError(traducirErrorAuth(err));
      } else if (alreadyRegistered) {
        // No es un error de Supabase: el registro "salió bien" con un user
        // vacío. Si no lo decimos, la alumna reintenta para siempre.
        setMode("login");
        setError(
          "Ese mail ya tiene una cuenta. Iniciá sesión, o usá \"Olvidé mi contraseña\"."
        );
      } else if (needsConfirmation) {
        setMode("login");
        setNotice(
          `Te mandamos un mail a ${email} para confirmar la cuenta. Abrilo antes de iniciar sesión — puede tardar unos minutos y a veces cae en spam.`
        );
      } else {
        setMode("login");
        setNotice("Cuenta creada. Ya podés iniciar sesión.");
      }
    } else {
      const dest = isAdminLogin ? "/admin" : next;
      // La promesa de signInWithPassword puede no resolver por un deadlock
      // conocido del browser client de @supabase/ssr, pero la cookie de
      // sesión sí se escribe. Detectamos el login exitoso por el cambio de
      // la cookie y hacemos un redirect de página completa (no depende de
      // que la promesa resuelva). El rol se revalida en el middleware.
      //
      // Comparamos el VALOR, no la presencia: con una contraseña mal puesta
      // la cookie vieja (sesión vencida, code-verifier de /recuperar) sigue
      // ahí, y chequear `document.cookie.includes("sb-")` redirigía igual,
      // tapando el mensaje de error.
      const antes = authCookieSnapshot();
      let redirected = false;
      const iv = window.setInterval(() => {
        const ahora = authCookieSnapshot();
        if (ahora && ahora !== antes) {
          redirected = true;
          window.clearInterval(iv);
          window.location.href = dest;
        }
      }, 200);
      window.setTimeout(() => window.clearInterval(iv), 8000);

      const { error: err } = await signIn(email, password).catch(() => ({
        error: "No se pudo iniciar sesión. Revisá tu conexión.",
      }));
      if (err && !redirected) {
        window.clearInterval(iv);
        setError(traducirErrorAuth(err));
        setLoading(false);
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
              onClick={() => { setMode("login"); setError(null); setNotice(null); }}
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
              onClick={() => { setMode("register"); setError(null); setNotice(null); }}
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

          {notice && (
            <div className="rounded-[10px] bg-[#E8F5E9] px-3 py-2.5 text-[12px] text-[#2E7D32] leading-relaxed">
              ✓ {notice}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3" onChange={() => setNotice(null)}>
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

            {mode === "login" && (
              <div className="text-center">
                <Link
                  href="/recuperar"
                  className="inline-block text-[13px] text-muted-foreground underline-offset-2 hover:text-foreground transition-colors"
                >
                  Olvidé mi contraseña
                </Link>
              </div>
            )}

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

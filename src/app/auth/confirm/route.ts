import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Flujo de token_hash (no PKCE): los mails de Supabase apuntan acá con
// ?token_hash=...&type=recovery|email. A diferencia de exchangeCodeForSession,
// no depende del code_verifier guardado en el navegador que pidió el mail, así
// que funciona si la alumna pide el reseteo en la compu y abre el mail en el
// celular. Ver docs/email-templates/README.md.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next");

  // Viene de una URL de un mail: sin este guard es un open redirect.
  // "//evil.com" es protocol-relative, por eso no alcanza con startsWith("/").
  const next =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : null;

  const redirectTo = request.nextUrl.clone();
  redirectTo.search = ""; // el token no sigue viaje al historial ni al Referer

  if (!tokenHash && !code) {
    redirectTo.pathname = "/login";
    redirectTo.searchParams.set("error", "link_invalido");
    return NextResponse.redirect(redirectTo);
  }

  const supabase = await createClient();

  // Dos formas de llegar acá, según qué plantilla mandó el mail:
  //
  //   token_hash  → las nuestras (docs/email-templates/). Es el camino bueno:
  //                 no depende del navegador que pidió el mail.
  //   code        → las default de Supabase, que usan PKCE. Solo funciona si
  //                 el mail se abre en el mismo navegador que lo pidió, porque
  //                 el code_verifier está en una cookie de ahí. Lo aceptamos
  //                 igual: sin esto, un link de plantilla default falla el
  //                 100% de las veces en vez de solo cuando cambia de aparato.
  const { error } =
    tokenHash && type
      ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
      : await supabase.auth.exchangeCodeForSession(code!);

  if (error) {
    // El caso común no es un link falso sino uno vencido o ya usado.
    redirectTo.pathname = "/login";
    redirectTo.searchParams.set("error", "link_vencido");
    return NextResponse.redirect(redirectTo);
  }

  // Con la sesión abierta, /nueva-clave se protege sola.
  // El `type` viene en los links de nuestras plantillas; en los de PKCE puede
  // faltar, y ahí lo deducimos del `next` que armó el pedido de reseteo.
  const esRecovery = type === "recovery" || next === "/nueva-clave";
  redirectTo.pathname = next ?? (esRecovery ? "/nueva-clave" : "/");
  return NextResponse.redirect(redirectTo);
}

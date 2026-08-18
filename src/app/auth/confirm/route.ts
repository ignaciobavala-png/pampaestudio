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
  const rawNext = searchParams.get("next");

  // Viene de una URL de un mail: sin este guard es un open redirect.
  // "//evil.com" es protocol-relative, por eso no alcanza con startsWith("/").
  const next =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : null;

  const redirectTo = request.nextUrl.clone();
  redirectTo.search = ""; // el token no sigue viaje al historial ni al Referer

  if (!tokenHash || !type) {
    redirectTo.pathname = "/login";
    redirectTo.searchParams.set("error", "link_invalido");
    return NextResponse.redirect(redirectTo);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

  if (error) {
    // El caso común no es un link falso sino uno vencido o ya usado.
    redirectTo.pathname = "/login";
    redirectTo.searchParams.set("error", "link_vencido");
    return NextResponse.redirect(redirectTo);
  }

  // verifyOtp deja la sesión abierta, así que /nueva-clave se protege sola.
  redirectTo.pathname = next ?? (type === "recovery" ? "/nueva-clave" : "/");
  return NextResponse.redirect(redirectTo);
}

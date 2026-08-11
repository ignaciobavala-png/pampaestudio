# Templates de email — Pampa Estudio

Plantillas HTML para los mails transaccionales de Supabase Auth.

| Archivo | Template en Supabase | Asunto sugerido |
|---|---|---|
| `confirm-signup.html` | Confirm sign up | `Confirmá tu cuenta en Pampa Estudio` |
| `reset-password.html` | Reset password | `Restablecer tu contraseña — Pampa Estudio` |

El logo se sirve desde `https://www.pampaestudio.com/assets/flor-de-loto.png` (`public/assets/`).

### Los links usan `token_hash`, no `{{ .ConfirmationURL }}`

| Template | Link |
|---|---|
| Confirm sign up | `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email` |
| Reset password | `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery` |

`{{ .ConfirmationURL }}` (el default de Supabase) usa PKCE: el `code_verifier` queda en una
cookie **del navegador que pidió el mail**. Si la alumna pide el reseteo en la compu y abre
el mail en el celular, el canje falla. Probándolo uno mismo no se detecta nunca, porque en
la misma máquina anda perfecto. El flujo de `token_hash` no depende de estado local.

**Esto requiere una ruta que hoy no existe**: `/auth/confirm` con `supabase.auth.verifyOtp({ type, token_hash })`,
y hay que cambiar el `emailRedirectTo` de `src/lib/store/auth-store.ts:87` para que apunte
ahí en vez de a `/api/auth/callback` (que hace `exchangeCodeForSession`, o sea PKCE, y sirve
solo para OAuth). El matcher del middleware tiene que excluir `/auth/`. Ver la skill
`supabase-auth-mail-token-hash` en brain-data para el código completo y el guard de open
redirect.

---

## Requisito previo: SMTP propio

Supabase **no deja editar los templates hasta configurar SMTP custom**. El SMTP built-in
solo manda ~2 mails/hora, desde `noreply@mail.app.supabase.io`, y es únicamente para desarrollo.

### 1. Resend

1. Crear cuenta en https://resend.com (free: 3.000 mails/mes, 100/día).
2. **Domains → Add Domain** → `pampaestudio.com` (región: `sa-east-1` o `us-east-1`).
3. Resend muestra 3-4 registros DNS (MX + TXT de SPF y DKIM, y opcionalmente DMARC).
4. El DNS del dominio está en Vercel, así que los registros se cargan con:

   ```bash
   vercel dns add pampaestudio.com send MX feedback-smtp.<region>.amazonses.com 10
   vercel dns add pampaestudio.com send TXT "v=spf1 include:amazonses.com ~all"
   vercel dns add pampaestudio.com resend._domainkey TXT "p=<clave-dkim-de-resend>"
   ```

   (los valores exactos los da el panel de Resend — copiar de ahí, no de acá)
5. **Verify DNS Records** en Resend. Suele tardar unos minutos.
6. **API Keys → Create API Key** (permiso *Sending access*). Guardar el valor `re_...`.

### 2. Supabase

**Project Settings → Authentication → SMTP Settings → Enable Custom SMTP**

| Campo | Valor |
|---|---|
| Sender email | `hola@pampaestudio.com` |
| Sender name | `Pampa Estudio` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | la API key `re_...` |

Guardar. En **Rate Limits**, subir el envío de mails por hora (default 30) si hace falta.

### 3. URLs de redirección

**Authentication → URL Configuration**

- Site URL: `https://www.pampaestudio.com`
- Redirect URLs:
  - `https://www.pampaestudio.com/api/auth/callback`
  - `https://pampaestudio.com/api/auth/callback`
  - `http://localhost:3000/api/auth/callback`

Sin esto, los links de los mails redirigen al Site URL por defecto y el login queda colgado.

✅ Ya cargado (11-ago-2026). Cuando se construya `/auth/confirm` hay que sumar también
`https://www.pampaestudio.com/auth/confirm`, el apex, `http://localhost:3000/auth/confirm`
y el wildcard de previews `https://pampa-estudio-*.vercel.app/auth/confirm`.

### 4. Cargar los templates

**Authentication → Emails** → pestaña de cada template → pegar el contenido del `.html`
correspondiente y el asunto de la tabla de arriba → Save.

---

## Estado (11-ago-2026)

El estudio abre el mes que viene, así que esto queda pausado a mitad de camino.

**Hecho:**

- Dominio `pampaestudio.com` en Vercel, DNS en `ns1/ns2.vercel-dns.com`.
- Los dos templates HTML de esta carpeta, listos para pegar.
- **Site URL** = `https://www.pampaestudio.com` y **Redirect URLs** cargadas
  (`www`, apex y `localhost:3000`, todas con `/api/auth/callback`). Verificado.

**Pendiente para el lanzamiento:**

1. Cuenta de Resend + DNS + SMTP en Supabase (pasos arriba). **Bloquea todo lo demás.**
2. Pegar los dos templates HTML (solo se puede después del punto 1).
3. Ruta `/auth/confirm` con `verifyOtp` + `emailRedirectTo` apuntando ahí + `/auth/`
   excluido del middleware. Sin esto los links de los templates no resuelven.
4. Construir el flujo de reseteo en la app: hoy no hay link "Olvidé mi contraseña" en
   `/login` ni pantalla `/nueva-clave` para setear la clave nueva. Que el formulario
   responda lo mismo exista o no la cuenta, para no ser un oráculo de enumeración.
5. Google OAuth **no está habilitado** en Supabase: el endpoint `/auth/v1/authorize`
   devuelve `Unsupported provider: provider is not enabled`. `signInWithGoogle()` en
   `src/lib/store/auth-store.ts:70` es código muerto — o se habilita el provider o se
   saca el botón del login.
6. `src/app/api/auth/callback/route.ts` solo lee `code` de los query params. Los errores
   de link vencido llegan en el *fragment* (`#error=access_denied&error_code=otp_expired`),
   que nunca llega al servidor, así que un link viejo cae en el genérico
   `/login?error=auth_callback_error`. Conviene manejarlo client-side para poder decir
   "el link venció, pedí uno nuevo".

### Cómo verificar las Redirect URLs sin mandar mails

`/auth/v1/verify` con un token inválido resuelve el `redirect_to` contra la allow-list
y no tiene efectos secundarios. Si la URL está permitida redirige a ella misma; si no,
cae al Site URL:

```bash
ANON=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d= -f2-)
curl -s -o /dev/null -D - "https://<ref>.supabase.co/auth/v1/verify\
?token=probeinvalid&type=recovery&redirect_to=<url-encodeada>&apikey=$ANON" | grep -i ^location:
```

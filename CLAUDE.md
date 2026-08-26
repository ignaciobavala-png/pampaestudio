# CLAUDE.md — Pampa Estudio

App de gestión para un estudio de **Pilates**. Next.js App Router + Supabase.

> Yoga salió de la app el 18-ago-2026: el estudio es solo Pilates. Quedan 7
> `class_templates` de Yoga archivadas (`is_active = false`) con sus bookings,
> por eso el CHECK de `discipline` todavía admite el valor viejo.

## Stack

- **Framework**: Next.js (App Router)
- **DB + Auth**: Supabase (PostgreSQL + RLS)
- **Estilos**: Tailwind CSS v4 + shadcn/ui
- **Deploy**: Vercel
- **Package manager**: pnpm

## Reglas críticas

### 1. Server Actions en el admin

Todo el dashboard `/admin/**` usa Server Actions (`"use server"`).
**Nunca usar el browser client en rutas de admin.**

> El browser singleton de `createBrowserClient` se corrompió por errores 500 de
> RLS. Las operaciones quedaban colgadas sin error visible.

Los clientes salen de `@/lib/supabase/admin-guard`: `getServerSupabase()` (con
la sesión, respeta RLS), `getServiceClient()` (service_role, se saltea RLS) y
`assertAdmin()`. **No volver a copiarlos por archivo** — estaban duplicados en
tres.

### 2. Fechas: navegador vs servidor

Son dos problemas distintos y ya están resueltos por separado:

- **Cliente**: `toLocalDateStr()` en `@/lib/utils`. Nunca usar
  `toISOString().slice(0,10)`: convierte a UTC y en Argentina corre la fecha un
  día hacia adelante de noche.
- **Servidor** (Server Actions, crons): `@/lib/time`, anclado a
  `America/Argentina/Buenos_Aires`. El reloj de Vercel es UTC, y por eso el KPI
  de ingresos cortaba el mes tres horas antes de tiempo. Los crons de
  `vercel.json` están en UTC pero calculados para las 09:00/09:30 de Argentina.

### 3. Nada de leer el reloj durante el render

Para mostrar algo que depende de la hora actual, usar `useNow()`
(`@/lib/hooks/use-now`). Llamar `Date.now()` en el cuerpo de un componente
congela el valor en el primer render y rompe la hidratación.

### 4. Cargar datos en un efecto

El patrón que pasa el lint **y** evita condiciones de carrera:

```tsx
useEffect(() => {
  let cancelled = false;
  fetchAlgo().then((data) => {
    if (!cancelled) setData(data);
  });
  return () => { cancelled = true; };
}, [dep]);
```

Llamar un `useCallback` que hace `setState` desde el efecto **no** pasa el lint
(`react-hooks/set-state-in-effect`). Para refrescar después de una mutación,
usar una `refreshKey` que sea dependencia del efecto, así hay un solo lugar que
carga. Y derivar `loading` de si lo cargado coincide con lo pedido
(`loadedKey !== key`) en vez de una bandera manual.

## Variables de entorno requeridas

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=    ← auth.admin.listUsers() y operaciones admin
CRON_SECRET=                  ← keep-alive de Supabase
```

## Schema

**Catálogos** (editables desde `/admin/catalogo`, antes hardcodeados):
- `teachers`: id, full_name (unique), is_active, sort_order
- `rooms`: id, name (unique), is_active, sort_order
- `class_types`: id, name (unique), is_active, sort_order
  → **Reformer, Mat, etc. Es la unidad sobre la que se arman los packs.**
  → Ojo: `Reformer` también existe como *sala*. Sala y tipo son cosas distintas.

**Núcleo**:
- `profiles`: id, full_name, role (admin/client), phone (**E.164**), is_approved,
  medical_notes, experience_level
- `class_templates`: name, discipline, **teacher_id / room_id / class_type_id**
  (FKs), day_of_week (0=lunes), time_start/end, max_capacity, is_active,
  **recurrence** (`weekly` | `once`), **specific_date**, **price** (centavos),
  **is_standalone**
- `bookings`: user_id, template_id, date, status (confirmed/waitlist/cancelled),
  waitlist_position, **user_pack_id** (de qué pack salió el crédito),
  **payment_status** (not_required/pending/paid), **price** (snapshot)
- `packs`: name, price (**centavos**), period, credits, duration_days, features,
  is_featured, is_active, sort_order
- `pack_class_types`: (pack_id, class_type_id) — **qué habilita cada pack**
- `user_packs`: user_id, pack_id, credits_remaining, status
  (active/expired/cancelled/frozen), starts_at, expires_at, frozen_at
- `notifications`: user_id, type, title, body, data, read_at

### Trampas del schema

- **`price` va en centavos** en `packs` y en `class_templates`. Las pantallas
  trabajan en pesos y convierten al guardar.
- **`bookings` tiene un UNIQUE (user_id, template_id, date) que no filtra por
  estado.** Por eso `book_spot` reutiliza la fila cancelada con
  `on conflict do update` en vez de insertar: si no, una alumna que cancela no
  puede volver a reservar esa clase nunca.
- **`day_of_week`: 0 = lunes**, no domingo. En JS es al revés.
- Traer "las clases de un día" no es filtrar por `day_of_week`: hay que incluir
  las únicas de esa fecha. Usar `dayOccurrenceFilter()` de `@/lib/classes`.
- Mostrar una clase siempre necesita el mismo join: `CLASS_TEMPLATE_SELECT`.

## Packs, tipos de clase y clases sueltas

Decisión de la dueña (18-ago-2026):

- Un pack se arma **por tipo de clase** (Reformer, Mat), no por clase puntual
  del horario, así sobrevive a los cambios de grilla.
- Una **clase suelta** es una clase que **no está dentro de ningún pack**. No
  hay flag: se deriva con `class_is_standalone()`. Lleva precio propio y no
  consume créditos.
- `is_standalone` en la clase es la escotilla para sacar una clase puntual
  aunque su tipo esté en un pack (ej: una masterclass que se cobra aparte).

⚠️ **Un pack sin filas en `pack_class_types` no habilita nada** y vuelve sueltas
a sus clases. Los 4 packs que ya existían se sembraron con todos los tipos para
preservar el comportamiento anterior.

## Funciones SQL clave

| Función | Quién la llama | Nota |
|---|---|---|
| `book_spot(template_id, date)` | Cliente autenticado | Elige un pack que **cubra el tipo** de la clase, gastando primero el que vence antes. Las sueltas no consumen crédito y quedan `payment_status = pending`. |
| `cancel_booking(booking_id)` | Cliente autenticado | Devuelve el crédito **al pack del que salió** (`user_pack_id`), y solo si faltan más de 2h. |
| `class_is_standalone(template_id)` | App (authenticated) | Deriva si la clase es suelta. |
| `admin_book_spot(user_id, template_id, date)` | Solo service_role | Igual que `book_spot` pero el admin puede reservar sin crédito. |
| `admin_cancel_class(template_id, date)` | Solo service_role | REVOKE de authenticated aplicado. |
| `is_admin()` | RLS policies | SECURITY DEFINER para evitar recursión. |
| `count_confirmed(template_id, date)` | Público | Cupo en tiempo real. |
| `run_pack_alerts()` | Cron | Vence packs y genera avisos. Compara con `now()` sobre timestamptz: son instantes absolutos, ahí no hay bug de TZ. |

## Rutas

**Alumna**: `/` (packs) · `/clases` · `/clases/[id]` · `/pago` · `/confirmacion` ·
`/agenda` · `/perfil` · `/login`

**Auth**: `/recuperar` (pide el mail) · `/nueva-clave` (setea la contraseña) ·
`/auth/confirm` (route handler con `verifyOtp`)

> `/auth/**` está **excluido del matcher del middleware** (`src/middleware.ts`):
> `/auth/confirm` setea las cookies de sesión con `verifyOtp` y el middleware
> las pisaría.

**Admin**: `/admin` (hoy) · `/admin/semana` · `/admin/clientes` ·
`/admin/packs` · `/admin/catalogo` · `/admin/nueva-clase`

## Circuito del alumno

```
Registro → Admin aprueba (is_approved=true) → Admin asigna pack →
Alumna reserva clase → Ve en agenda → Puede cancelar
```

> Una alumna sin aprobar entra a la app normalmente y **solo falla al reservar**.
> Antes de debuggear auth, chequear `is_approved`.

### Mails de auth (24-ago-2026)

**Confirm email está apagado** (`mailer_autoconfirm: true`). El control de acceso
real es `is_approved`, que el admin da a mano: pedir además confirmar el mail no
sumaba control, solo un paso más que se podía romper. Para chequear el estado sin
entrar al panel:

```bash
curl -s "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/settings" -H "apikey: <anon>" | jq .mailer_autoconfirm
```

**SMTP**: Resend, dominio `pampaestudio.com` verificado, remitente
`hola@pampaestudio.com`. Los mails **se entregan** — el log está en
<https://resend.com/emails>. Las plantillas propias
(`docs/email-templates/`) están cargadas.

#### El bug que costó encontrar

Reportaban "no puedo crear la cuenta". Las cuentas **se creaban**: `/signup`
devolvía 200 y la fila quedaba en `auth.users`. El mail **se entregaba**. Lo que
no funcionaba era el link:

```
mail entregado ✓ → click → /verify de GoTrue → vuelve con ?code= → link inválido
```

Supabase seguía con sus plantillas default, que arman el link con
`{{ .ConfirmationURL }}` (PKCE, devuelve `code`), y `/auth/confirm` solo aceptaba
`token_hash`. Fallaba el 100% de las veces, en cualquier dispositivo.

**Orden para debuggear esto, que no es el intuitivo:**

1. ¿La cuenta existe? → `select email, confirmed_at from auth.users`
2. ¿El mail salió? → log de Resend. Si dice `delivered`, el envío no es el problema.
3. ¿Qué asunto tiene? **En inglés = plantillas default**, y ahí está la falla.
4. ¿Dónde pega el click? → `auth_logs`. En `/verify` = default; en `/auth/confirm` = las nuestras.

`/auth/confirm` ahora acepta los dos formatos: `token_hash` (el bueno, no depende
del navegador que pidió el mail) y `code` como red por si vuelve una plantilla
default.

#### `signUp` devuelve 200 sin que el registro sirva

Tres desenlaces distintos, todos con `error: null` (`@/lib/store/auth-store`):

| Caso | Cómo se detecta |
|---|---|
| Mail ya registrado | `data.user.identities.length === 0` — user fantasma, para no filtrar qué direcciones existen |
| Cuenta sin confirmar | `!data.session` |
| Listo para entrar | hay `session` |

Tratar los tres como éxito es lo que hacía que la alumna intentara entrar, GoTrue
contestara `Invalid login credentials` y reintentara el registro para siempre.

#### Otras notas

- Las **Redirect URLs** del proyecto necesitan las dos familias: `/auth/confirm`
  (los mails) y `/api/auth/callback` (solo OAuth). Están las 7 cargadas, con el
  wildcard de los previews de Vercel.
- El proveedor de **Google está desactivado** en Supabase. Por eso se sacó
  `signInWithGoogle` del store — ningún componente lo llamaba.
  `/api/auth/callback` quedó en pie por si se vuelve a habilitar.

## Estado del backlog (18-ago-2026)

La lista completa, con el estado de cada feature y las decisiones de la dueña,
está en **`docs/features/backlog-2026-08.md`**. Leerlo antes de seguir.

- **Fase A ✅** teléfonos E.164, solo Pilates, clases de 50', TZ del servidor
- **Fase B ✅** catálogos (profes/salas/tipos), ABM de packs, clases únicas
- **Fase C ✅** packs por tipo de clase, clases sueltas, `book_spot` reescrita
- **Fase D ⬜** pagos y descuentos:
  - `payments` (efectivo cargado por la secretaría, monto, método, quién cobró)
  - ingresos reales (hoy `fetchMonthlyRevenue` **estima** sumando precios de
    lista de los packs asignados en el mes, no plata cobrada)
  - `settings` con alias/CBU (hoy el CBU está **hardcodeado** en
    `src/app/pago/page.tsx`)
  - descuentos → **bloqueado**: falta que Violeta defina si es un porcentaje por
    alumna, un código promocional o un precio con vigencia

### Otros pendientes

- [x] `SUPABASE_SERVICE_ROLE_KEY` y `CRON_SECRET` en `.env.local`; `CRON_SECRET`
      también cargado en Vercel (26-ago-2026)
- [ ] SMTP propio (Resend) → destraba la edición de templates de email
- [ ] Pegar los templates con `token_hash` en Supabase — **bloqueado por el SMTP**:
      el flujo de reseteo ya está hecho en la app, ver `docs/email-templates/README.md`
- [ ] Integración Mercado Pago → **después** de `payments` y `settings`: sin
      registro de pagos ni datos bancarios cargados es construir sobre arena
- [ ] Una clase suelta se puede reservar pero **no hay forma de cobrarla**
      (queda `pending`); el flujo de cobro es la fase D
- [ ] El admin no tiene dónde ver quién debe plata
- [ ] Botones placeholder en admin: Recordatorio, Duplicar clase, Asistencia, Exportar
- [ ] Revisar que el tipo de clase de las 5 clases activas quedó bien: se
      infirió del nombre al separar sala de tipo

## Seguridad DB (Supabase advisors)

- `admin_cancel_class`: resuelto — RAISE EXCEPTION + REVOKE de authenticated ✅
- `class_is_standalone`: revocada de `anon`, solo authenticated ✅
- `book_spot` / `cancel_booking` / `is_admin`: warnings aceptados — son
  intencionales y los guards internos están bien ✅
- Leaked password protection: requiere plan Pro, ignorado ✅

## Verificación

- `pnpm exec tsc --noEmit` y `pnpm exec next build` tienen que quedar limpios.
- `pnpm exec eslint src` está en **0 errores**; no dejar que vuelvan a entrar.
  Los warnings que quedan son `<img>` sin `next/image` y variables sin usar.
- Para probar lógica SQL contra datos reales sin ensuciar producción:
  `begin; set local request.jwt.claims = '{"sub":"<uuid>","role":"authenticated"}'; ... rollback;`

# CLAUDE.md — Pampa Estudio

App de gestión para estudio de yoga/pilates. Next.js App Router + Supabase.

## Stack

- **Framework**: Next.js (App Router)
- **DB + Auth**: Supabase (PostgreSQL + RLS)
- **Estilos**: Tailwind CSS v4 + shadcn/ui
- **Deploy**: Vercel
- **Package manager**: pnpm

## Regla crítica: Server Actions en el admin

Todo el dashboard `/admin/**` usa Server Actions (`"use server"` + `createServerClient`).
**Nunca usar el browser client en rutas de admin.**

> El browser singleton de `createBrowserClient` se corrompió por errores 500 de RLS.
> Las operaciones quedaban colgadas sin error visible.

## Variables de entorno requeridas

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=    ← necesaria para auth.admin.listUsers() y operaciones admin
CRON_SECRET=                  ← para el keep-alive de Supabase
```

## Schema principal

- `profiles`: id, full_name, role (admin/client), phone, is_approved
- `class_templates`: day_of_week, time_start/end, teacher, room, discipline, max_capacity, is_active
- `bookings`: user_id, template_id, date, status (confirmed/waitlist/cancelled), waitlist_position
- `packs`: id, name, credits, price, period, is_active, sort_order
- `user_packs`: user_id, pack_id, credits_remaining, status (active/expired), starts_at

## Funciones SQL clave

| Función | Quién la llama | Nota |
|---|---|---|
| `book_spot(template_id, date)` | Cliente autenticado | Descuenta crédito, maneja lista de espera |
| `cancel_booking(booking_id)` | Cliente autenticado | Devuelve crédito si estaba confirmada |
| `admin_cancel_class(template_id, date)` | Solo service_role | REVOKE de authenticated aplicado |
| `is_admin()` | RLS policies | SECURITY DEFINER para evitar recursión |
| `count_confirmed(template_id, date)` | Público | Para mostrar cupo en tiempo real |

## Circuito del alumno

```
Registro → Admin aprueba (is_approved=true) → Admin asigna pack → Alumna reserva clase → Ve en agenda → Puede cancelar
```

## Pendientes para producción

- [ ] `SUPABASE_SERVICE_ROLE_KEY` en `.env.local` y en Vercel
- [ ] `CRON_SECRET` en `.env.local` y en Vercel
- [ ] Dominio propio → configurar SMTP en Supabase + cargar templates de email
- [ ] Integración Mercado Pago (flujo de compra de packs por el alumno)
- [ ] Botones placeholder en admin: Recordatorio, Duplicar clase, Asistencia, Exportar
- [ ] Historial real de clases en modal de cliente (hoy sin datos)

## Seguridad DB (Supabase advisors)

- `admin_cancel_class`: resuelto — RAISE EXCEPTION + REVOKE de authenticated ✅
- `book_spot` / `cancel_booking`: warnings aceptados — intencionales, guards internos correctos ✅
- `is_admin`: warning aceptado — solo lectura, usada en RLS policies ✅
- Leaked password protection: requiere plan Pro, ignorado ✅

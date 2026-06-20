# Zenith Studio

PWA de gestión de reservas para un estudio de yoga en Palermo. Dos interfaces: app mobile-first para alumnas + dashboard admin para gestión.

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| Hosting | Vercel |
| DB + Auth | Supabase (Postgres + Auth + RLS) |
| Estilo | Tailwind CSS v4 + shadcn/ui con tema custom |
| Estado cliente | Zustand |
| Animaciones | Framer Motion |
| Tipografía | Newsreader (serif) + Hanken Grotesk (sans-serif) vía `next/font` |

## Roles de usuario

| Rol | Descripción |
|-----|-------------|
| `admin` | Gestiona clases, clientes, aprueba registros y asigna packs. Accede vía `/admin`. |
| `client` | Alumna. Navega packs, reserva clases, gestiona su agenda y perfil. |

## Vistas del cliente (mobile-first)

| Ruta | Vista | Descripción |
|------|-------|-------------|
| `/` | Packs | Selección y activación de membresías |
| `/clases` | Clases | Grilla diaria con filtros por disciplina |
| `/agenda` | Mi agenda | Calendario mensual + próximas reservas |
| `/perfil` | Perfil | Datos personales, pack activo, créditos, historial |
| `/login` | Login | Email/contraseña (Google OAuth en v2) |

## Vistas del admin (desktop-first)

| Ruta | Vista | Descripción |
|------|-------|-------------|
| `/admin` | Hoy | KPIs del día, lista de clases, detalle con cupo y listado de alumnas |
| `/admin/semana` | Semana | Calendario semanal con eventos por disciplina |
| `/admin/clientes` | Clientes | Buscador y grilla de alumnas con perfil detallado |
| `/admin/nueva-clase` | Nueva clase | Formulario de creación de clases recurrentes |

## Diseño de referencia

Los bocetos originales están en `docs/design/`. Definen la totalidad del diseño visual, componentes y flujos. Son la spec contra la que se implementa cada vista:

- `zenith-home.html` — App cliente (mobile-first, 462px)
- `zenith-admin.html` — Dashboard admin (desktop-first, responsive)

## Flujo principal MVP

```
Registro → Admin aprueba y asigna pack → Usuaria explora clases → Reserva (gasta crédito) → Ve en agenda
```

- El admin crea packs con cantidad de créditos y precio (informativo en MVP).
- El admin asigna packs manualmente a las alumnas aprobadas desde el dashboard.
- Las alumnas gastan 1 crédito por reserva. Sin créditos no pueden reservar.
- Si la clase está llena, entran automáticamente en lista de espera.
- Al cancelar una reserva, el crédito se devuelve y se notifica a la primera en espera.

### v2 (futuro)

- MercadoPago Checkout para compra de packs autogestionada.
- Google OAuth como alternativa de login.
- Notificaciones push para recordatorios y liberación de cupos.

## Schema de base de datos

### Tablas

#### `profiles`
Extiende `auth.users`. Se crea vía trigger automático al registrarse.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | `uuid PK` | FK → `auth.users.id` |
| `full_name` | `text` | Nombre completo |
| `role` | `text` | `'admin'` \| `'client'`. Default `'client'`. |
| `phone` | `text?` | Teléfono (opcional) |
| `is_approved` | `boolean` | Admin debe aprobar para que pueda reservar. Default `false`. |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

#### `packs`
Membresías disponibles. Creadas y gestionadas por el admin.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | `uuid PK` | |
| `name` | `text` | Ej: "Fusión" |
| `eyebrow` | `text` | Label pequeño. Ej: "★ Más elegido" |
| `description` | `text` | |
| `price` | `integer` | En centavos. $28.000 → 2800000 |
| `period` | `text` | `'monthly'` \| `'per_class'` |
| `credits` | `integer` | Créditos mensuales |
| `features` | `jsonb` | Array de features mostrados en la card |
| `is_featured` | `boolean` | Pack destacado (estilo visual especial) |
| `is_active` | `boolean` | |
| `sort_order` | `integer` | Orden de display |
| `created_at` | `timestamptz` | |

#### `user_packs`
Packs asignados por admin a cada alumna.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | `uuid PK` | |
| `user_id` | `uuid FK` | → `profiles.id` |
| `pack_id` | `uuid FK` | → `packs.id` |
| `credits_remaining` | `integer` | Créditos que le quedan este mes |
| `assigned_by` | `uuid FK?` | Admin que lo asignó → `profiles.id` |
| `starts_at` | `timestamptz` | |
| `expires_at` | `timestamptz?` | Null para packs tipo "Libre" (sin vencimiento) |
| `status` | `text` | `'active'` \| `'expired'` \| `'cancelled'` |
| `created_at` | `timestamptz` | |

#### `class_templates`
Plantillas de clases recurrentes (ej: "Vinyasa Flow, Lunes 08:00").

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | `uuid PK` | |
| `name` | `text` | Ej: "Vinyasa Flow Mañana" |
| `discipline` | `text` | `'Yoga'` \| `'Pilates'` |
| `teacher` | `text` | |
| `room` | `text` | `'Sala 1'` \| `'Sala 2'` \| `'Reformer'` |
| `day_of_week` | `integer` | 0 (Lun) – 6 (Dom) |
| `time_start` | `time` | |
| `time_end` | `time` | |
| `max_capacity` | `integer` | Cupo máximo |
| `description` | `text?` | |
| `is_active` | `boolean` | |
| `created_at` | `timestamptz` | |
| `created_by` | `uuid FK` | → `profiles.id` |

#### `bookings`
Reservas de alumnas en una clase para una fecha específica.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | `uuid PK` | |
| `user_id` | `uuid FK` | → `profiles.id` |
| `template_id` | `uuid FK` | → `class_templates.id` |
| `date` | `date` | Fecha de la clase |
| `status` | `text` | `'confirmed'` \| `'cancelled'` \| `'waitlist'` |
| `waitlist_position` | `integer?` | Posición en lista de espera |
| `created_at` | `timestamptz` | |
| `cancelled_at` | `timestamptz?` | |

### Reglas de negocio

- **Cupo**: `class_templates.max_capacity` define el cupo máximo. Las reservas `confirmed` se cuentan. Si `COUNT(confirmed) >= max_capacity`, nuevas reservas van a `waitlist`.
- **Cancelación**: devuelve el crédito (si `status='confirmed'`) y libera el lugar. Si hay waitlist, el admin notifica manualmente a la primera en fila.
- **Créditos**: cada reserva confirmed consume 1 crédito del `user_packs.credits_remaining`. Sin créditos no se puede reservar.
- **Unicidad**: una alumna no puede reservar dos veces la misma clase en la misma fecha.

### Índices

```sql
CREATE INDEX idx_bookings_template_date ON bookings(template_id, date) WHERE status = 'confirmed';
CREATE INDEX idx_bookings_user_date ON bookings(user_id, date);
CREATE INDEX idx_class_templates_day ON class_templates(day_of_week) WHERE is_active = true;
CREATE UNIQUE INDEX idx_bookings_unique ON bookings(user_id, template_id, date) WHERE status != 'cancelled';
```

### RLS — Políticas por rol

| Tabla | Client (`role=client`) | Admin (`role=admin`) |
|-------|------------------------|----------------------|
| `profiles` | SELECT propia, UPDATE propia | SELECT/UPDATE ALL |
| `packs` | SELECT (is_active=true) | ALL |
| `user_packs` | SELECT propio | ALL |
| `class_templates` | SELECT (is_active=true) | ALL |
| `bookings` | SELECT propias, INSERT propias, UPDATE propias (cancelar) | ALL |

### Admin seed

Al correr la primera migración se inserta un admin inicial:
```sql
-- El admin se crea manualmente registrándose y luego actualizando su role:
UPDATE profiles SET role = 'admin', is_approved = true WHERE id = '<uuid_del_admin>';
```

## Estructura del proyecto

```
zenith-studio/
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # Root layout: fonts, providers, toast
│   │   ├── page.tsx                     # Packs view (home)
│   │   ├── clases/
│   │   │   └── page.tsx                 # Class schedule
│   │   ├── agenda/
│   │   │   └── page.tsx                 # User agenda + calendar
│   │   ├── perfil/
│   │   │   └── page.tsx                 # User profile
│   │   ├── login/
│   │   │   └── page.tsx                 # Login page
│   │   ├── admin/
│   │   │   ├── layout.tsx               # Admin layout + auth guard
│   │   │   ├── page.tsx                 # Today overview
│   │   │   ├── semana/
│   │   │   │   └── page.tsx             # Weekly calendar
│   │   │   ├── clientes/
│   │   │   │   └── page.tsx             # Clients list + detail
│   │   │   └── nueva-clase/
│   │   │       └── page.tsx             # New class form
│   │   └── api/
│   │       └── auth/
│   │           └── callback/
│   │               └── route.ts         # Supabase auth callback
│   ├── components/
│   │   ├── ui/                          # shadcn/ui primitives
│   │   ├── layout/
│   │   │   ├── topbar.tsx               # Header con brand + user CTA
│   │   │   ├── bottom-nav.tsx           # Navegación inferior (mobile)
│   │   │   └── sheet.tsx                # Bottom sheet genérico
│   │   ├── packs/
│   │   │   ├── pack-card.tsx            # Card de pack
│   │   │   ├── pack-list.tsx            # Lista de packs
│   │   │   └── funnel-steps.tsx         # Indicador de pasos del funnel
│   │   ├── classes/
│   │   │   ├── class-card.tsx           # Card de clase en grilla
│   │   │   ├── class-sheet.tsx          # Sheet de detalle de clase
│   │   │   ├── day-strip.tsx            # Tira de días horizontal
│   │   │   └── filter-chips.tsx         # Chips de filtro
│   │   ├── agenda/
│   │   │   ├── mini-calendar.tsx        # Calendario mensual
│   │   │   ├── agenda-list.tsx          # Lista de próximas clases
│   │   │   └── booking-detail.tsx       # Detalle de reserva
│   │   ├── booking/
│   │   │   ├── confirm-sheet.tsx        # Sheet de confirmación
│   │   │   ├── waitlist-sheet.tsx       # Sheet de lista de espera
│   │   │   └── reserve-button.tsx       # Botón de reserva con lógica
│   │   ├── profile/
│   │   │   ├── profile-header.tsx       # Avatar + nombre + email
│   │   │   └── profile-section.tsx      # Sección colapsable
│   │   ├── login/
│   │   │   └── login-form.tsx           # Formulario de login
│   │   ├── admin/
│   │   │   ├── kpi-card.tsx             # Card de KPI
│   │   │   ├── day-tabs.tsx             # Tabs de días
│   │   │   ├── class-detail.tsx         # Panel de detalle de clase
│   │   │   ├── capacity-stepper.tsx     # Ajuste de cupo
│   │   │   ├── student-list.tsx         # Listado de alumnas
│   │   │   ├── waitlist-panel.tsx       # Panel de lista de espera
│   │   │   ├── week-calendar.tsx        # Calendario semanal
│   │   │   ├── client-card.tsx          # Card de cliente
│   │   │   ├── client-detail.tsx        # Modal/perfil de cliente
│   │   │   ├── new-class-form.tsx       # Formulario de nueva clase
│   │   │   └── cancel-modal.tsx         # Modal de cancelación
│   │   └── shared/
│   │       ├── toast.tsx                # Sistema de toasts
│   │       ├── gate.tsx                 # Pantalla de "logueate primero"
│   │       └── empty-state.tsx          # Estado vacío genérico
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               # Cliente browser
│   │   │   ├── server.ts               # Cliente server
│   │   │   └── middleware.ts           # Actualización de sesión
│   │   ├── store/
│   │   │   ├── auth-store.ts           # Estado de auth (Zustand)
│   │   │   └── booking-store.ts        # Estado de reserva (Zustand)
│   │   ├── validations.ts              # Schemas de Zod
│   │   └── utils.ts                    # Helpers
│   └── types/
│       └── database.ts                 # Tipos generados de Supabase
├── supabase/
│   ├── migrations/                     # Migraciones SQL
│   └── seed.sql                        # Datos de prueba
├── public/
│   ├── manifest.json                   # PWA manifest
│   ├── sw.js                           # Service worker
│   └── icons/                          # App icons
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── README.md
```

## Diseño — Tokens de tema

Los dos HTML (`zenith-home.html`, `zenith-admin.html`) definen el lenguaje visual. Se traduce a Tailwind + shadcn/ui:

### Colores

| Token | Hex | Uso |
|-------|-----|-----|
| `--p` (paper) | `#EBEBE8` | Fondo general |
| `--s` (surface) | `#FFF` | Cards, sheets, modals |
| `--s2` | `#F6F6F5` | Superficie secundaria |
| `--ink` | `#1A191F` | Texto principal |
| `--ink2` | `#76747F` | Texto secundario |
| `--ink3` | `#AAA8B2` | Texto terciario / placeholder |
| `--v` (violet) | `#5B4BE0` | Acción primaria, links |
| `--v2` | `#7C6FF2` | Hover violet |
| `--vs` | `#ECE9FC` | Fondo violeta suave |
| `--cc` | `#DBDAD6` | Barras de progreso vacías, handles |
| `--am` (amber) | `#9A7B2E` | Pilates, warning |
| `--rd` (red) | `#C0392B` | Cancelar, peligro |

### Tipografía

- **Serif**: Newsreader (títulos, precios, nombres de clase) — `font-serif`
- **Sans**: Hanken Grotesk (body, UI, labels) — `font-sans`

### Radios

- `--r`: 22px (cards grandes)
- `--rsm`: 14px (banners, elementos internos)

## Plan de implementación

### Fase 1 — Setup y auth

- [ ] `npx create-next-app` con TypeScript + Tailwind v4 + App Router
- [ ] shadcn/ui init con tema custom (variables CSS del diseño Zenith)
- [ ] Proyecto Supabase: crear proyecto, obtener API keys
- [ ] Configurar `@supabase/ssr` con cookie-based auth
- [ ] Middleware de Next.js para refrescar sesión y proteger rutas
- [ ] Schema inicial: `profiles` con trigger on `auth.users`
- [ ] Layout base compartido: topbar + bottom nav + sheet overlay
- [ ] Página `/login` con formulario email/contraseña
- [ ] Register → email verification → redirect a home

### Fase 2 — Packs

- [ ] Migración: tabla `packs`
- [ ] Seed de 4 packs (Esencia, Studio, Fusión, Libre)
- [ ] Vista `/` con lista de packs, selección, funnel steps
- [ ] Admin: vista de clientes pendientes de aprobación
- [ ] Admin: asignar pack a cliente (`user_packs`)
- [ ] Estado de aprobación en perfil

### Fase 3 — Clases y reservas

- [ ] Migración: `class_templates` + `bookings`
- [ ] Admin: crear clases desde `/admin/nueva-clase`
- [ ] Vista `/clases`: day strip, filter chips, grilla de clases
- [ ] Cálculo de cupo en tiempo real (count bookings confirmed)
- [ ] Sheet de detalle de clase con botón de reserva
- [ ] Lógica de reserva: consumir crédito, crear booking
- [ ] Lista de espera automática cuando está lleno
- [ ] Cancelación de reserva con devolución de crédito

### Fase 4 — Agenda y perfil

- [ ] Vista `/agenda`: mini calendario mensual + próximas reservas
- [ ] Navegación de meses, dots en días con reservas
- [ ] Vista `/perfil`: datos personales, pack activo, créditos, historial
- [ ] Logout

### Fase 5 — Admin dashboard completo

- [ ] `/admin`: KPIs del día (clases, ocupación, espera, ingresos*)
- [ ] Panel de detalle de clase: asistentes, lista de espera, ajuste de cupo
- [ ] Modal de cancelación de clase con notificación
- [ ] `/admin/semana`: calendario semanal con eventos
- [ ] `/admin/clientes`: buscador, grilla, perfil detallado
- [ ] Historial de clases por cliente

> *Ingresos en v2 con MercadoPago. En MVP es informativo.

### Fase 6 — PWA y polish

- [ ] `manifest.json` con íconos, nombre, theme-color
- [ ] Service worker para cache offline (clases guardadas)
- [ ] Animaciones de transición entre páginas (Framer Motion)
- [ ] Transiciones de sheets (enter/exit)
- [ ] Responsive: admin mobile con bottom nav
- [ ] Toasts globales

### Fase 7 — Producción

- [ ] Variables de entorno en Vercel
- [ ] Supabase en producción (migraciones aplicadas)
- [ ] Seed de admin real
- [ ] DNS / dominio configurado
- [ ] Google OAuth (opcional, cuando se necesite)
- [ ] MercadoPago Checkout (opcional, cuando se necesite)

## Comandos

```bash
npm run dev          # Desarrollo local
npm run build        # Build de producción
npm run lint         # Lint
npm run typecheck    # Chequeo de tipos
npx supabase gen types typescript --local > src/types/database.ts
```

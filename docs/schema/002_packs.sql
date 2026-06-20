-- 002_packs
-- Membresías disponibles. Creadas y gestionadas por el admin.

create table if not exists public.packs (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  eyebrow     text not null default '',
  description text not null default '',
  price       integer not null check (price >= 0),        -- centavos, $28.000 = 2800000
  period      text not null check (period in ('monthly', 'per_class')),
  credits     integer not null check (credits > 0),
  features    jsonb not null default '[]'::jsonb,
  is_featured boolean not null default false,
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- Políticas RLS

alter table public.packs enable row level security;

-- Admin: acceso total
create policy "Admin full access"
  on public.packs
  as permissive for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Cualquier usuario autenticado (aprobado o no): ver packs activos
create policy "Authenticated select active"
  on public.packs
  as permissive for select
  to authenticated
  using (is_active = true);

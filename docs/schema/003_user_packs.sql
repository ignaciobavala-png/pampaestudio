-- 003_user_packs
-- Packs asignados por admin a cada alumna.

create table if not exists public.user_packs (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  pack_id           uuid not null references public.packs(id) on delete restrict,
  credits_remaining integer not null check (credits_remaining >= 0),
  assigned_by       uuid references public.profiles(id) on delete set null,
  starts_at         timestamptz not null default now(),
  expires_at        timestamptz,                              -- null para packs "Libre" (sin vencimiento)
  status            text not null default 'active' check (status in ('active', 'expired', 'cancelled')),
  created_at        timestamptz not null default now()
);

create index idx_user_packs_user on public.user_packs(user_id) where status = 'active';

-- Políticas RLS

alter table public.user_packs enable row level security;

-- Admin: acceso total
create policy "Admin full access"
  on public.user_packs
  as permissive for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Client: ver sus packs activos
create policy "Client select own"
  on public.user_packs
  as permissive for select
  to authenticated
  using (user_id = auth.uid());

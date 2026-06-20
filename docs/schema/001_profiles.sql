-- 001_profiles
-- Extiende auth.users. Trigger automático al registrarse.

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  role        text not null default 'client' check (role in ('admin', 'client')),
  is_approved boolean not null default false,
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Trigger: crear perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), 'client');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger: updated_at automático
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Políticas RLS

alter table public.profiles enable row level security;

-- Admin: acceso total
create policy "Admin full access"
  on public.profiles
  as permissive for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Client: leer su propio perfil
create policy "Client select own"
  on public.profiles
  as permissive for select
  to authenticated
  using (id = auth.uid());

-- Client: actualizar su propio perfil (no puede cambiar role ni is_approved)
create policy "Client update own"
  on public.profiles
  as permissive for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Permitir insert del trigger (security definer)
create policy "Allow trigger insert"
  on public.profiles
  as permissive for insert
  to authenticated
  with check (true);

-- Admin seed: después de registrar al admin, ejecutar:
-- update public.profiles set role = 'admin', is_approved = true where id = '<uuid>';

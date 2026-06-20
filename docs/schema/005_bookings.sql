-- 005_bookings
-- Reservas de alumnas en una clase para una fecha específica.

create table if not exists public.bookings (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles(id) on delete cascade,
  template_id        uuid not null references public.class_templates(id) on delete restrict,
  date               date not null,
  status             text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'waitlist')),
  waitlist_position  integer,
  created_at         timestamptz not null default now(),
  cancelled_at       timestamptz,

  -- Unicidad: una alumna no puede reservar dos veces la misma clase en la misma fecha
  -- (excepto si canceló, puede volver a reservar)
  constraint bookings_unique_user_class_date unique (user_id, template_id, date)
);

create index idx_bookings_template_date on public.bookings(template_id, date)
  where status = 'confirmed';
create index idx_bookings_user_date on public.bookings(user_id, date);

-- Función: obtener la posición de waitlist para una clase + fecha
create or replace function public.get_next_waitlist_position(
  p_template_id uuid,
  p_date date
) returns integer as $$
  select coalesce(max(waitlist_position), 0) + 1
  from public.bookings
  where template_id = p_template_id and date = p_date and status = 'waitlist';
$$ language sql stable;

-- Función: contar reservas confirmed para una clase + fecha
create or replace function public.count_confirmed(
  p_template_id uuid,
  p_date date
) returns integer as $$
  select count(*)::integer
  from public.bookings
  where template_id = p_template_id and date = p_date and status = 'confirmed';
$$ language sql stable;

-- Función: verificar si la clase está llena
create or replace function public.is_class_full(
  p_template_id uuid,
  p_date date
) returns boolean as $$
  select public.count_confirmed(p_template_id, p_date) >= (
    select max_capacity from public.class_templates where id = p_template_id
  );
$$ language sql stable;

-- Políticas RLS

alter table public.bookings enable row level security;

-- Admin: acceso total
create policy "Admin full access"
  on public.bookings
  as permissive for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Client: ver sus propias reservas
create policy "Client select own"
  on public.bookings
  as permissive for select
  to authenticated
  using (user_id = auth.uid());

-- Client: insertar reserva (solo si está aprobada, tiene créditos y la clase no está llena)
-- La lógica de créditos y waitlist se maneja en la aplicación / RPC
create policy "Approved client insert"
  on public.bookings
  as permissive for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.profiles where id = auth.uid() and is_approved = true)
  );

-- Client: cancelar su propia reserva (cambiar status a cancelled)
create policy "Client cancel own"
  on public.bookings
  as permissive for update
  to authenticated
  using (user_id = auth.uid() and status in ('confirmed', 'waitlist'))
  with check (user_id = auth.uid() and status = 'cancelled');

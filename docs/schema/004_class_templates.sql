-- 004_class_templates
-- Plantillas de clases recurrentes (ej: "Vinyasa Flow, Lunes 08:00").

create table if not exists public.class_templates (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  discipline    text not null check (discipline in ('Yoga', 'Pilates')),
  teacher       text not null,
  room          text not null check (room in ('Sala 1', 'Sala 2', 'Reformer')),
  day_of_week   integer not null check (day_of_week between 0 and 6),   -- 0=Lun, 6=Dom
  time_start    time not null,
  time_end      time not null,
  max_capacity  integer not null check (max_capacity between 1 and 30),
  description   text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  created_by    uuid references public.profiles(id) on delete set null,
  constraint class_templates_time_check check (time_end > time_start)
);

create index idx_class_templates_day on public.class_templates(day_of_week) where is_active = true;

-- Políticas RLS

alter table public.class_templates enable row level security;

-- Admin: acceso total
create policy "Admin full access"
  on public.class_templates
  as permissive for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Clientes aprobados: ver templates activos
create policy "Approved client select active"
  on public.class_templates
  as permissive for select
  to authenticated
  using (
    is_active = true
    and exists (select 1 from public.profiles where id = auth.uid() and is_approved = true)
  );

-- Clientes no aprobados: también pueden ver (para explorar antes de que los aprueben),
-- pero no pueden reservar (eso se controla en bookings)
create policy "Pending client select active"
  on public.class_templates
  as permissive for select
  to authenticated
  using (is_active = true);

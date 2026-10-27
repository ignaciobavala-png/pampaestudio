-- Credenciales que carga la dueña desde el panel (Mercado Pago hoy). Tienen
-- prioridad sobre las variables de entorno, así no dependen de un deploy.
-- Solo service_role: ni anon ni authenticated pueden leer ni escribir, ni
-- siquiera el admin por RLS; el panel pasa por Server Actions con assertAdmin.
create table public.app_secrets (
  key text primary key check (key in ('mercadopago_access_token', 'mercadopago_webhook_secret')),
  value text not null check (length(value) > 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

alter table public.app_secrets enable row level security;
revoke all on public.app_secrets from anon, authenticated;

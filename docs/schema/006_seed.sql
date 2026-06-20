-- 006_seed
-- Datos iniciales: packs del estudio.

-- Limpiar si ya existen (para idempotencia en desarrollo)
delete from public.packs;

insert into public.packs (name, eyebrow, description, price, period, credits, features, is_featured, sort_order) values
(
  'Esencia',
  'Yoga',
  '4 clases al mes, a tu ritmo.',
  2800000,    -- $28.000
  'monthly',
  4,
  '["Yoga Hatha y Vinyasa", "4 créditos mensuales", "Cancelá hasta 8hs antes"]'::jsonb,
  false,
  1
),
(
  'Studio',
  'Pilates',
  '8 clases de Mat. Reformer disponible.',
  4200000,    -- $42.000
  'monthly',
  8,
  '["Pilates Mat y Reformer", "8 créditos mensuales", "Cambio de horario sin cargo"]'::jsonb,
  false,
  2
),
(
  'Fusión',
  '★ Más elegido',
  '12 clases combinables + talleres.',
  6200000,    -- $62.000
  'monthly',
  12,
  '["Todas las disciplinas", "12 créditos mensuales", "2 talleres incluidos por mes", "7am–9pm · 6 días"]'::jsonb,
  true,
  3
),
(
  'Libre',
  'Flexible',
  'Clases sueltas, sin vencimiento.',
  950000,     -- $9.500
  'per_class',
  1,
  '["Cualquier disciplina", "Sin vencimiento", "Comprá de a una o en paquete"]'::jsonb,
  false,
  4
);

-- Nota: el admin se crea manualmente luego de registrarse:
-- 1. Registrarse con email/contraseña desde /login
-- 2. Ejecutar en SQL Editor de Supabase:
--    update public.profiles set role = 'admin', is_approved = true where id = '<uuid>';

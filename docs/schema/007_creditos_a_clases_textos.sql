-- "Créditos" → "clases" en los textos que la alumna ve y que salen de la base.
-- Reescribe book_spot y run_pack_alerts sobre su propia definición (conserva
-- permisos y el resto del cuerpo) y corrige las notificaciones ya guardadas.
-- Los nombres de columnas (credits, credits_remaining) y el type 'low_credits'
-- no cambian: no se ven en pantalla.
do $$
declare
  v_def text;
begin
  select pg_get_functiondef(p.oid) into v_def from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='public' and p.proname='book_spot';
  v_def := replace(v_def, 'No tenes creditos disponibles. Compra un pack para reservar.', 'No tenés clases disponibles. Comprá un pack para reservar.');
  execute v_def;

  select pg_get_functiondef(p.oid) into v_def from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='public' and p.proname='run_pack_alerts';
  v_def := replace(v_def, 'Te quedaste sin créditos', 'Te quedaste sin clases');
  v_def := replace(v_def, 'Ya no te quedan créditos.', 'Ya no te quedan clases.');
  v_def := replace(v_def, 'Te queda 1 crédito en tu pack.', 'Te queda 1 clase en tu pack.');
  execute v_def;
end $$;

update public.notifications
   set title = replace(title, 'créditos', 'clases'),
       body  = replace(replace(replace(body, 'Ya no te quedan créditos.', 'Ya no te quedan clases.'), 'Te queda 1 crédito en tu pack.', 'Te queda 1 clase en tu pack.'), 'créditos', 'clases')
 where type = 'low_credits' and (title ~* 'cr[eé]dit' or body ~* 'cr[eé]dit');

-- freezePack escribe status = 'frozen', pero el CHECK original no lo admitía y
-- congelar un pack fallaba con check_violation.
alter table public.user_packs drop constraint user_packs_status_check;
alter table public.user_packs add constraint user_packs_status_check
  check (status = any (array['active','expired','cancelled','frozen']));

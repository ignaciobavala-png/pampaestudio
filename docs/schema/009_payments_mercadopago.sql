-- Pagos (Mercado Pago hoy; efectivo y transferencia después) y la función que
-- acredita el pack. Ver "Mercado Pago" en CLAUDE.md.
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  pack_id uuid references public.packs(id),
  booking_id uuid references public.bookings(id),
  user_pack_id uuid references public.user_packs(id),
  amount integer not null check (amount > 0),            -- centavos, como packs.price
  method text not null check (method in ('mercadopago','cash','transfer')),
  status text not null default 'pending'
    check (status in ('pending','approved','rejected','cancelled','refunded','review')),
  mp_preference_id text,
  mp_payment_id text,
  collected_by uuid references public.profiles(id),
  notes text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  updated_at timestamptz not null default now(),
  check (pack_id is not null or booking_id is not null)
);

create unique index payments_mp_payment_id_key on public.payments (mp_payment_id) where mp_payment_id is not null;
create index payments_user_idx on public.payments (user_id, created_at desc);
create index payments_status_idx on public.payments (status) where status in ('pending','review');

alter table public.payments enable row level security;

-- Solo lectura desde la app: todo lo que escribe va por service_role.
create policy payments_select_own_or_admin on public.payments
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

revoke all on public.payments from anon, authenticated;
grant select on public.payments to authenticated;

-- Aplica el resultado de un pago de Mercado Pago. Idempotente: se puede llamar
-- N veces con el mismo pago (webhook + pantalla de retorno + reintentos de MP).
-- El pack nace una sola vez, detrás del lock de la fila.
create or replace function public.apply_mp_payment(
  p_payment_id uuid,
  p_mp_payment_id text,
  p_mp_status text,
  p_amount numeric
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pay public.payments;
  v_pack public.packs;
  v_new_status text;
  v_user_pack_id uuid;
  v_expires timestamptz;
begin
  select * into v_pay from public.payments where id = p_payment_id for update;
  if not found then
    return jsonb_build_object('error', 'payment_not_found');
  end if;
  if v_pay.method <> 'mercadopago' then
    return jsonb_build_object('error', 'wrong_method');
  end if;

  v_new_status := case p_mp_status
    when 'approved' then 'approved'
    when 'rejected' then 'rejected'
    when 'cancelled' then 'cancelled'
    when 'refunded' then 'refunded'
    when 'charged_back' then 'refunded'
    else 'pending'
  end;

  -- Evento viejo que llega tarde: no puede deshacer un pago ya acreditado.
  if v_pay.status = 'approved' and v_new_status in ('pending','rejected','cancelled') then
    return jsonb_build_object('status', v_pay.status, 'ignored', true);
  end if;

  if v_new_status = 'approved' then
    -- Un segundo pago aprobado sobre la misma orden es plata cobrada de más.
    if v_pay.user_pack_id is not null then
      return jsonb_build_object(
        'status', 'approved', 'user_pack_id', v_pay.user_pack_id,
        'duplicate_payment', v_pay.mp_payment_id is distinct from p_mp_payment_id
      );
    end if;

    -- El monto cobrado tiene que ser el guardado (en pesos vs centavos).
    if round(p_amount * 100)::integer <> v_pay.amount then
      update public.payments
         set status = 'review', mp_payment_id = p_mp_payment_id, updated_at = now()
       where id = v_pay.id;
      return jsonb_build_object('error', 'amount_mismatch', 'status', 'review');
    end if;

    select * into v_pack from public.packs where id = v_pay.pack_id;
    if not found then
      update public.payments set status = 'review', mp_payment_id = p_mp_payment_id, updated_at = now()
       where id = v_pay.id;
      return jsonb_build_object('error', 'pack_not_found', 'status', 'review');
    end if;

    -- Fin del día (23:59:59) en Buenos Aires, duration_days después de hoy.
    v_expires := case when v_pack.duration_days is null then null else
      ((date_trunc('day', now() at time zone 'America/Argentina/Buenos_Aires')
        + make_interval(days => v_pack.duration_days)
        + interval '23 hours 59 minutes 59 seconds') at time zone 'America/Argentina/Buenos_Aires')
    end;

    insert into public.user_packs (user_id, pack_id, credits_remaining, status, starts_at, expires_at)
    values (v_pay.user_id, v_pack.id, v_pack.credits, 'active', now(), v_expires)
    returning id into v_user_pack_id;

    update public.payments
       set status = 'approved', mp_payment_id = p_mp_payment_id, user_pack_id = v_user_pack_id,
           paid_at = now(), updated_at = now()
     where id = v_pay.id;

    insert into public.notifications (user_id, type, title, body, data)
    values (v_pay.user_id, 'payment_approved', 'Pago acreditado',
            'Tu pack ' || v_pack.name || ' ya está activo. ¡Reservá tu primera clase!',
            jsonb_build_object('payment_id', v_pay.id, 'user_pack_id', v_user_pack_id));

    return jsonb_build_object('status', 'approved', 'user_pack_id', v_user_pack_id);
  end if;

  if v_new_status = 'refunded' then
    update public.payments
       set status = 'refunded', mp_payment_id = coalesce(p_mp_payment_id, mp_payment_id), updated_at = now()
     where id = v_pay.id;
    if v_pay.user_pack_id is not null then
      update public.user_packs set status = 'cancelled' where id = v_pay.user_pack_id and status = 'active';
    end if;
    return jsonb_build_object('status', 'refunded');
  end if;

  update public.payments
     set status = v_new_status, updated_at = now()
   where id = v_pay.id;
  return jsonb_build_object('status', v_new_status);
end;
$$;

revoke all on function public.apply_mp_payment(uuid, text, text, numeric) from public, anon, authenticated;
grant execute on function public.apply_mp_payment(uuid, text, text, numeric) to service_role;

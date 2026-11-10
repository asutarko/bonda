-- Run this once in the Supabase Dashboard → SQL Editor for this project,
-- after profiles_add_professional_fields.sql and push_notifications.sql.
--
-- Parent ↔ professional (doctor / therapist / psychologist) matching, and the
-- one-time platform commission.
--
-- Business rule: a professional pays nothing up front. When a parent taps
-- "Say hello" and the professional accepts, that's a match. The parent then
-- pays the professional's first session through the app; the platform keeps
-- commission_rate (50%) of that one session and the rest goes to the
-- professional. Every later session between the same pair is commission-free.
-- The commission is charged ONCE PER PARENT–PROFESSIONAL PAIR, enforced by
-- unique (pro_id, parent_id) — a pair can never have two rows.
--
-- Status flow:
--   requested ──accept──▶ matched ──payment webhook──▶ paid
--       │                    │                           │
--       └─decline─▶ declined └─cancel─▶ cancelled        └─refund─▶ refunded
--   A declined / cancelled / refunded pair may say hello again; that reuses
--   the same row (back to 'requested'), so a pair is still charged at most
--   once for as long as a payment stands.
--
-- Users never write this table directly: every change goes through the
-- security-definer functions below, and marking a row paid/refunded is only
-- allowed from the service role (the payment gateway webhook), so nobody can
-- unlock a match without paying.

-- ── The professional's per-session fee (SGD), set on their profile ────────
alter table public.profiles add column if not exists session_fee numeric(10,2)
  check (session_fee is null or session_fee > 0);

-- ── Matches ───────────────────────────────────────────────────────────────
create table if not exists public.pro_matches (
  id uuid primary key default gen_random_uuid(),
  pro_id uuid not null references auth.users (id) on delete cascade,
  parent_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'requested'
    check (status in ('requested', 'matched', 'declined', 'cancelled', 'paid', 'refunded')),
  message text not null default '',            -- the parent's "Say hello" note
  -- Snapshot of the professional's fee when they accepted, so raising the fee
  -- later never changes what this pair owes.
  session_fee numeric(10,2),
  commission_rate numeric(4,3) not null default 0.5,
  commission_amount numeric(10,2) generated always as (round(session_fee * commission_rate, 2)) stored,
  payout_amount numeric(10,2) generated always as (session_fee - round(session_fee * commission_rate, 2)) stored,
  payment_ref text,                            -- gateway payment id, set by the webhook
  requested_at timestamptz not null default now(),
  matched_at timestamptz,
  paid_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (pro_id, parent_id),
  check (pro_id <> parent_id)
);

create index if not exists pro_matches_parent_idx on public.pro_matches (parent_id, status);
create index if not exists pro_matches_pro_idx on public.pro_matches (pro_id, status);

alter table public.pro_matches enable row level security;

-- Both sides of a match can read it; nobody gets insert/update/delete policies.
drop policy if exists "Match participants read their matches" on public.pro_matches;
create policy "Match participants read their matches"
  on public.pro_matches for select
  to authenticated
  using (auth.uid() in (pro_id, parent_id));

do $$
begin
  alter publication supabase_realtime add table public.pro_matches;
exception when duplicate_object then null;
end $$;

-- ── Parent: "Say hello" ───────────────────────────────────────────────────
create or replace function public.request_pro_match(p_pro_id uuid, p_message text default '')
returns public.pro_matches
language plpgsql security definer set search_path = public as $$
declare
  v_row public.pro_matches;
  v_name text;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if not exists (
    select 1 from profiles where id = p_pro_id and account_type = 'professional' and session_fee is not null
  ) then
    raise exception 'This professional is not accepting requests yet';
  end if;

  insert into pro_matches (pro_id, parent_id, message)
  values (p_pro_id, auth.uid(), left(coalesce(p_message, ''), 500))
  on conflict (pro_id, parent_id) do update
    set status = 'requested', message = excluded.message, requested_at = now(),
        matched_at = null, session_fee = null, updated_at = now()
    where pro_matches.status in ('declined', 'cancelled', 'refunded')
  returning * into v_row;

  if v_row.id is null then
    raise exception 'You already have a request or match with this professional';
  end if;

  select coalesce(nullif(trim(name), ''), 'A parent') into v_name from profiles where id = auth.uid();
  perform send_push(array[p_pro_id], v_name || ' said hello', left(v_row.message, 120), '/', 'pro-match-' || v_row.id);
  return v_row;
end $$;

-- ── Professional: accept or decline ───────────────────────────────────────
create or replace function public.respond_pro_match(p_match_id uuid, p_accept boolean)
returns public.pro_matches
language plpgsql security definer set search_path = public as $$
declare
  v_row public.pro_matches;
  v_fee numeric(10,2);
  v_name text;
begin
  select session_fee, coalesce(nullif(trim(name), ''), 'The professional')
    into v_fee, v_name from profiles where id = auth.uid();

  if p_accept and v_fee is null then
    raise exception 'Set your session fee before accepting';
  end if;

  update pro_matches
     set status = case when p_accept then 'matched' else 'declined' end,
         session_fee = case when p_accept then v_fee else null end,
         matched_at = case when p_accept then now() else null end,
         updated_at = now()
   where id = p_match_id and pro_id = auth.uid() and status = 'requested'
  returning * into v_row;

  if v_row.id is null then raise exception 'Request not found or already answered'; end if;

  perform send_push(
    array[v_row.parent_id],
    case when p_accept then v_name || ' accepted your hello' else v_name || ' is not available' end,
    case when p_accept then 'Pay the first session to start chatting.' else '' end,
    '/', 'pro-match-' || v_row.id);
  return v_row;
end $$;

-- ── Either side: withdraw before payment ──────────────────────────────────
create or replace function public.cancel_pro_match(p_match_id uuid)
returns public.pro_matches
language plpgsql security definer set search_path = public as $$
declare v_row public.pro_matches;
begin
  update pro_matches set status = 'cancelled', updated_at = now()
   where id = p_match_id and auth.uid() in (pro_id, parent_id) and status in ('requested', 'matched')
  returning * into v_row;
  if v_row.id is null then raise exception 'Nothing to cancel'; end if;
  return v_row;
end $$;

-- ── Payment gateway webhook only (service role) ───────────────────────────
-- Call from an Edge Function after the gateway confirms the parent paid
-- session_fee. commission_amount is the platform's cut; payout_amount is owed
-- to the professional.
create or replace function public.mark_pro_match_paid(p_match_id uuid, p_payment_ref text)
returns public.pro_matches
language plpgsql security definer set search_path = public as $$
declare v_row public.pro_matches;
begin
  update pro_matches set status = 'paid', payment_ref = p_payment_ref, paid_at = now(), updated_at = now()
   where id = p_match_id and status = 'matched'
  returning * into v_row;
  if v_row.id is null then raise exception 'Match is not awaiting payment'; end if;
  perform send_push(array[v_row.pro_id, v_row.parent_id], 'Match confirmed', 'You can now chat freely.', '/', 'pro-match-' || v_row.id);
  return v_row;
end $$;

create or replace function public.mark_pro_match_refunded(p_match_id uuid)
returns public.pro_matches
language plpgsql security definer set search_path = public as $$
declare v_row public.pro_matches;
begin
  update pro_matches set status = 'refunded', updated_at = now()
   where id = p_match_id and status = 'paid'
  returning * into v_row;
  if v_row.id is null then raise exception 'Match is not paid'; end if;
  return v_row;
end $$;

revoke all on function public.request_pro_match(uuid, text) from public, anon;
revoke all on function public.respond_pro_match(uuid, boolean) from public, anon;
revoke all on function public.cancel_pro_match(uuid) from public, anon;
grant execute on function public.request_pro_match(uuid, text) to authenticated;
grant execute on function public.respond_pro_match(uuid, boolean) to authenticated;
grant execute on function public.cancel_pro_match(uuid) to authenticated;

revoke all on function public.mark_pro_match_paid(uuid, text) from public, anon, authenticated;
revoke all on function public.mark_pro_match_refunded(uuid) from public, anon, authenticated;
grant execute on function public.mark_pro_match_paid(uuid, text) to service_role;
grant execute on function public.mark_pro_match_refunded(uuid) to service_role;

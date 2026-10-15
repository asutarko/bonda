-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Run it BEFORE deploying the app version that reads these tables.
--
-- Moves each child's clinics, therapists and case workers out of the
-- newline-joined, index-aligned text columns on "children" (clinic_*,
-- doctor_name, therapist_*, case_worker_*) into one row per entry, so they
-- can be indexed and searched across children (e.g. "every child seeing a
-- therapist at centre X", "children per clinic").
--
-- Transition: the old columns are kept, and set_child_entries() below keeps
-- writing them too, so anything still reading them (e.g. the admin app)
-- keeps working. Drop them in a later migration once nothing reads them
-- any more (that migration must also remove the mirroring in
-- set_child_entries below).

create extension if not exists pg_trgm;

-- ---------- tables ----------

create table if not exists public.child_clinics (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Optional link to the admin-managed clinics directory (clinics.sql), so
  -- the same clinic is one id instead of several spellings. Free-text
  -- name/address/phone stay for clinics not in the directory.
  clinic_id uuid references public.clinics (id) on delete set null,
  clinic_type text not null default '',
  name text not null default '',
  doctor text not null default '',
  address text not null default '',
  phone text not null default '',
  email text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.child_therapists (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default '',
  centre text not null default '',
  phone text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.child_case_workers (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default '',
  phone text not null default '',
  email text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- indexes ----------
-- child_id for loading a child's entries; trigram indexes so partial,
-- case-insensitive searches (name ilike '%kasih%') stay fast as data grows.

create index if not exists child_clinics_child_id_idx on public.child_clinics (child_id, sort_order);
create index if not exists child_clinics_user_id_idx on public.child_clinics (user_id);
create index if not exists child_clinics_clinic_id_idx on public.child_clinics (clinic_id);
create index if not exists child_clinics_name_trgm_idx on public.child_clinics using gin (name gin_trgm_ops);
create index if not exists child_clinics_doctor_trgm_idx on public.child_clinics using gin (doctor gin_trgm_ops);

create index if not exists child_therapists_child_id_idx on public.child_therapists (child_id, sort_order);
create index if not exists child_therapists_user_id_idx on public.child_therapists (user_id);
create index if not exists child_therapists_name_trgm_idx on public.child_therapists using gin (name gin_trgm_ops);
create index if not exists child_therapists_centre_trgm_idx on public.child_therapists using gin (centre gin_trgm_ops);

create index if not exists child_case_workers_child_id_idx on public.child_case_workers (child_id, sort_order);
create index if not exists child_case_workers_user_id_idx on public.child_case_workers (user_id);
create index if not exists child_case_workers_name_trgm_idx on public.child_case_workers using gin (name gin_trgm_ops);

-- ---------- row level security ----------
-- The owning parent sees and edits only their own children's entries;
-- admins (profiles.role = 'admin') can read and manage every row, so
-- cross-child search works from the admin side.

do $$
declare t text;
begin
  foreach t in array array['child_clinics', 'child_therapists', 'child_case_workers'] loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists "Users can view their own entries" on public.%I', t);
    execute format('create policy "Users can view their own entries" on public.%I for select to authenticated using (auth.uid() = user_id)', t);

    execute format('drop policy if exists "Users can insert their own entries" on public.%I', t);
    execute format('create policy "Users can insert their own entries" on public.%I for insert to authenticated with check (auth.uid() = user_id and exists (select 1 from public.children c where c.id = child_id and c.user_id = auth.uid()))', t);

    execute format('drop policy if exists "Users can update their own entries" on public.%I', t);
    execute format('create policy "Users can update their own entries" on public.%I for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);

    execute format('drop policy if exists "Users can delete their own entries" on public.%I', t);
    execute format('create policy "Users can delete their own entries" on public.%I for delete to authenticated using (auth.uid() = user_id)', t);

    execute format('drop policy if exists "Admins can manage all entries" on public.%I', t);
    execute format('create policy "Admins can manage all entries" on public.%I for all to authenticated using (exists (select 1 from public.profiles where id = auth.uid() and role = ''admin'')) with check (exists (select 1 from public.profiles where id = auth.uid() and role = ''admin''))', t);
  end loop;
end $$;

-- ---------- copy existing data ----------
-- Splits each old column on newlines; position i across a group's columns is
-- one entry. Fully blank entries are skipped. Children that already have rows
-- are skipped too, so re-running this file is safe.

insert into public.child_clinics (child_id, user_id, clinic_type, name, doctor, address, phone, email, sort_order)
select child_id, user_id, clinic_type, name, doctor, address, phone, email, row_number() over (partition by child_id order by i) - 1
from (
  select c.id as child_id, c.user_id, i,
    coalesce(trim((string_to_array(c.clinic_type, E'\n'))[i]), '') as clinic_type,
    coalesce(trim((string_to_array(c.clinic_name, E'\n'))[i]), '') as name,
    coalesce(trim((string_to_array(c.doctor_name, E'\n'))[i]), '') as doctor,
    coalesce(trim((string_to_array(c.clinic_address, E'\n'))[i]), '') as address,
    coalesce(trim((string_to_array(c.clinic_phone, E'\n'))[i]), '') as phone,
    coalesce(trim((string_to_array(c.clinic_email, E'\n'))[i]), '') as email
  from public.children c
  cross join lateral generate_series(1, greatest(
    coalesce(array_length(string_to_array(c.clinic_type, E'\n'), 1), 0),
    coalesce(array_length(string_to_array(c.clinic_name, E'\n'), 1), 0),
    coalesce(array_length(string_to_array(c.doctor_name, E'\n'), 1), 0),
    coalesce(array_length(string_to_array(c.clinic_address, E'\n'), 1), 0),
    coalesce(array_length(string_to_array(c.clinic_phone, E'\n'), 1), 0),
    coalesce(array_length(string_to_array(c.clinic_email, E'\n'), 1), 0)
  )) as i
  where not exists (select 1 from public.child_clinics x where x.child_id = c.id)
) s
where clinic_type <> '' or name <> '' or doctor <> '' or address <> '' or phone <> '' or email <> '';

insert into public.child_therapists (child_id, user_id, name, centre, phone, sort_order)
select child_id, user_id, name, centre, phone, row_number() over (partition by child_id order by i) - 1
from (
  select c.id as child_id, c.user_id, i,
    coalesce(trim((string_to_array(c.therapist_name, E'\n'))[i]), '') as name,
    coalesce(trim((string_to_array(c.therapist_centre, E'\n'))[i]), '') as centre,
    coalesce(trim((string_to_array(c.therapist_phone, E'\n'))[i]), '') as phone
  from public.children c
  cross join lateral generate_series(1, greatest(
    coalesce(array_length(string_to_array(c.therapist_name, E'\n'), 1), 0),
    coalesce(array_length(string_to_array(c.therapist_centre, E'\n'), 1), 0),
    coalesce(array_length(string_to_array(c.therapist_phone, E'\n'), 1), 0)
  )) as i
  where not exists (select 1 from public.child_therapists x where x.child_id = c.id)
) s
where name <> '' or centre <> '' or phone <> '';

insert into public.child_case_workers (child_id, user_id, name, phone, email, sort_order)
select child_id, user_id, name, phone, email, row_number() over (partition by child_id order by i) - 1
from (
  select c.id as child_id, c.user_id, i,
    coalesce(trim((string_to_array(c.case_worker_name, E'\n'))[i]), '') as name,
    coalesce(trim((string_to_array(c.case_worker_phone, E'\n'))[i]), '') as phone,
    coalesce(trim((string_to_array(c.case_worker_email, E'\n'))[i]), '') as email
  from public.children c
  cross join lateral generate_series(1, greatest(
    coalesce(array_length(string_to_array(c.case_worker_name, E'\n'), 1), 0),
    coalesce(array_length(string_to_array(c.case_worker_phone, E'\n'), 1), 0),
    coalesce(array_length(string_to_array(c.case_worker_email, E'\n'), 1), 0)
  )) as i
  where not exists (select 1 from public.child_case_workers x where x.child_id = c.id)
) s
where name <> '' or phone <> '' or email <> '';

-- ---------- save function ----------
-- Replaces one or more of a child's entry lists in a single transaction (a
-- null argument leaves that list untouched), so a save can never leave a
-- child half-deleted. Runs as the caller, so the RLS policies above apply.
-- Also mirrors the lists back into the legacy newline-joined columns for the
-- transition period — remove that part when the legacy columns are dropped.

create or replace function public.set_child_entries(
  p_child_id uuid,
  p_clinics jsonb default null,
  p_therapists jsonb default null,
  p_case_workers jsonb default null
) returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_owner uuid;
begin
  select user_id into v_owner from public.children where id = p_child_id;
  if v_owner is null then
    raise exception 'Child % not found', p_child_id;
  end if;

  if p_clinics is not null then
    delete from public.child_clinics where child_id = p_child_id;
    insert into public.child_clinics (child_id, user_id, clinic_id, clinic_type, name, doctor, address, phone, email, sort_order)
    select p_child_id, v_owner, nullif(e->>'clinicId', '')::uuid,
      coalesce(trim(e->>'type'), ''), coalesce(trim(e->>'name'), ''), coalesce(trim(e->>'doctor'), ''),
      coalesce(trim(e->>'address'), ''), coalesce(trim(e->>'phone'), ''), coalesce(trim(e->>'email'), ''),
      (o - 1)::int
    from jsonb_array_elements(p_clinics) with ordinality as t(e, o);

    update public.children set
      clinic_type    = coalesce((select string_agg(clinic_type, E'\n' order by sort_order) from public.child_clinics where child_id = p_child_id), ''),
      clinic_name    = coalesce((select string_agg(name,        E'\n' order by sort_order) from public.child_clinics where child_id = p_child_id), ''),
      doctor_name    = coalesce((select string_agg(doctor,      E'\n' order by sort_order) from public.child_clinics where child_id = p_child_id), ''),
      clinic_address = coalesce((select string_agg(address,     E'\n' order by sort_order) from public.child_clinics where child_id = p_child_id), ''),
      clinic_phone   = coalesce((select string_agg(phone,       E'\n' order by sort_order) from public.child_clinics where child_id = p_child_id), ''),
      clinic_email   = coalesce((select string_agg(email,       E'\n' order by sort_order) from public.child_clinics where child_id = p_child_id), '')
    where id = p_child_id;
  end if;

  if p_therapists is not null then
    delete from public.child_therapists where child_id = p_child_id;
    insert into public.child_therapists (child_id, user_id, name, centre, phone, sort_order)
    select p_child_id, v_owner,
      coalesce(trim(e->>'name'), ''), coalesce(trim(e->>'centre'), ''), coalesce(trim(e->>'phone'), ''),
      (o - 1)::int
    from jsonb_array_elements(p_therapists) with ordinality as t(e, o);

    update public.children set
      therapist_name   = coalesce((select string_agg(name,   E'\n' order by sort_order) from public.child_therapists where child_id = p_child_id), ''),
      therapist_centre = coalesce((select string_agg(centre, E'\n' order by sort_order) from public.child_therapists where child_id = p_child_id), ''),
      therapist_phone  = coalesce((select string_agg(phone,  E'\n' order by sort_order) from public.child_therapists where child_id = p_child_id), '')
    where id = p_child_id;
  end if;

  if p_case_workers is not null then
    delete from public.child_case_workers where child_id = p_child_id;
    insert into public.child_case_workers (child_id, user_id, name, phone, email, sort_order)
    select p_child_id, v_owner,
      coalesce(trim(e->>'name'), ''), coalesce(trim(e->>'phone'), ''), coalesce(trim(e->>'email'), ''),
      (o - 1)::int
    from jsonb_array_elements(p_case_workers) with ordinality as t(e, o);

    update public.children set
      case_worker_name  = coalesce((select string_agg(name,  E'\n' order by sort_order) from public.child_case_workers where child_id = p_child_id), ''),
      case_worker_phone = coalesce((select string_agg(phone, E'\n' order by sort_order) from public.child_case_workers where child_id = p_child_id), ''),
      case_worker_email = coalesce((select string_agg(email, E'\n' order by sort_order) from public.child_case_workers where child_id = p_child_id), '')
    where id = p_child_id;
  end if;
end;
$$;

grant execute on function public.set_child_entries(uuid, jsonb, jsonb, jsonb) to authenticated;

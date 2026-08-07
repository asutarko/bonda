-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Backs the Home screen's "Latest Articles" carousel. Rows are written
-- automatically by the fetch-articles Edge Function (see
-- supabase/functions/fetch-articles) on a daily schedule — no admin needs to
-- touch this table for it to stay fresh. Admins can still curate/remove rows
-- by hand from the admin app if something needs a manual fix.

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  tag text not null default 'Research',
  tone text not null default 'violet',
  title text not null,
  blurb text,
  url text not null unique,
  published_at timestamptz not null default now(),
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists articles_published_at_idx on public.articles (published_at desc);

alter table public.articles enable row level security;

drop policy if exists "Articles are viewable by authenticated users" on public.articles;
create policy "Articles are viewable by authenticated users"
  on public.articles for select
  to authenticated
  using (true);

drop policy if exists "Admins can manage articles" on public.articles;
create policy "Admins can manage articles"
  on public.articles for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- fetch-articles writes with the service role key, which bypasses RLS, so no
-- separate policy is needed for the automated inserts/updates.

-- ============================================================
-- Daily Progress Tracker — Supabase Schema
-- Run this once in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Profiles (display name + goal track)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  goal_track text default 'General Growth',
  created_at timestamptz not null default now()
);

-- Daily logs (one row per user per calendar day)
create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null,
  morning_data jsonb not null default '{}'::jsonb,
  night_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create index if not exists daily_logs_user_date_idx
  on public.daily_logs (user_id, log_date desc);

-- Auto-create profile when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, goal_track)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'goal_track', 'General Growth')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.daily_logs enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
drop policy if exists "Users read own logs" on public.daily_logs;
drop policy if exists "Users insert own logs" on public.daily_logs;
drop policy if exists "Users update own logs" on public.daily_logs;
drop policy if exists "Users delete own logs" on public.daily_logs;

create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users read own logs"
  on public.daily_logs for select
  using (auth.uid() = user_id);

create policy "Users insert own logs"
  on public.daily_logs for insert
  with check (auth.uid() = user_id);

create policy "Users update own logs"
  on public.daily_logs for update
  using (auth.uid() = user_id);

create policy "Users delete own logs"
  on public.daily_logs for delete
  using (auth.uid() = user_id);

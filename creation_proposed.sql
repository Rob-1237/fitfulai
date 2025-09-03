-- *) Additions from Claude
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- 0) Required extension for gen_random_uuid()
create extension if not exists pgcrypto;

-- 1) Helper trigger to auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- 2) TABLES
-- workouts
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  exercises jsonb not null,
  scheduled_date timestamptz,
  duration_minutes integer,
  calories_burned integer,
  completed boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- meals
create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  meal_type text check (meal_type in ('breakfast','lunch','dinner','snack')),
  ingredients jsonb not null,
  nutrition_info jsonb,
  scheduled_date timestamptz,
  ai_generated boolean default false,
  workout_sync_id uuid references public.workouts(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- grocery_lists
create table if not exists public.grocery_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  items jsonb not null,
  meal_plan_ids uuid[] default '{}',
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

-- ai_cache
create table if not exists public.ai_cache (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  request_hash text unique not null,
  response_data jsonb not null,
  prompt_type text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

-- 3) TRIGGERS to keep updated_at fresh
drop trigger if exists t_upd_workouts on public.workouts;
create trigger t_upd_workouts
before update on public.workouts
for each row execute function public.handle_updated_at();

drop trigger if exists t_upd_meals on public.meals;
create trigger t_upd_meals
before update on public.meals
for each row execute function public.handle_updated_at();

drop trigger if exists t_upd_grocery_lists on public.grocery_lists;
create trigger t_upd_grocery_lists
before update on public.grocery_lists
for each row execute function public.handle_updated_at();

drop trigger if exists t_upd_ai_cache on public.ai_cache;
create trigger t_upd_ai_cache
before update on public.ai_cache
for each row execute function public.handle_updated_at();

-- 4) RLS: enable and add "own rows only" policies
alter table public.workouts enable row level security;
alter table public.meals enable row level security;
alter table public.grocery_lists enable row level security;
alter table public.ai_cache enable row level security;

-- workouts policies
drop policy if exists "workouts_select_own" on public.workouts;
drop policy if exists "workouts_insert_own" on public.workouts;
drop policy if exists "workouts_update_own" on public.workouts;
drop policy if exists "workouts_delete_own" on public.workouts;
create policy "workouts_select_own" on public.workouts
  for select using (auth.uid() = user_id);
create policy "workouts_insert_own" on public.workouts
  for insert with check (auth.uid() = user_id);
create policy "workouts_update_own" on public.workouts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "workouts_delete_own" on public.workouts
  for delete using (auth.uid() = user_id);

-- meals policies
drop policy if exists "meals_select_own" on public.meals;
drop policy if exists "meals_insert_own" on public.meals;
drop policy if exists "meals_update_own" on public.meals;
drop policy if exists "meals_delete_own" on public.meals;
create policy "meals_select_own" on public.meals
  for select using (auth.uid() = user_id);
create policy "meals_insert_own" on public.meals
  for insert with check (auth.uid() = user_id);
create policy "meals_update_own" on public.meals
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "meals_delete_own" on public.meals
  for delete using (auth.uid() = user_id);

-- grocery_lists policies
drop policy if exists "grocery_lists_select_own" on public.grocery_lists;
drop policy if exists "grocery_lists_insert_own" on public.grocery_lists;
drop policy if exists "grocery_lists_update_own" on public.grocery_lists;
drop policy if exists "grocery_lists_delete_own" on public.grocery_lists;
create policy "grocery_lists_select_own" on public.grocery_lists
  for select using (auth.uid() = user_id);
create policy "grocery_lists_insert_own" on public.grocery_lists
  for insert with check (auth.uid() = user_id);
create policy "grocery_lists_update_own" on public.grocery_lists
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "grocery_lists_delete_own" on public.grocery_lists
  for delete using (auth.uid() = user_id);

-- ai_cache policies
drop policy if exists "ai_cache_select_own" on public.ai_cache;
drop policy if exists "ai_cache_insert_own" on public.ai_cache;
drop policy if exists "ai_cache_update_own" on public.ai_cache;
drop policy if exists "ai_cache_delete_own" on public.ai_cache;
create policy "ai_cache_select_own" on public.ai_cache
  for select using (auth.uid() = user_id);
create policy "ai_cache_insert_own" on public.ai_cache
  for insert with check (auth.uid() = user_id);
create policy "ai_cache_update_own" on public.ai_cache
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ai_cache_delete_own" on public.ai_cache
  for delete using (auth.uid() = user_id);

-- 5) INDEXES
create index if not exists idx_workouts_user_date on public.workouts(user_id, scheduled_date);
create index if not exists idx_meals_user_date on public.meals(user_id, scheduled_date);
create index if not exists idx_grocery_lists_user on public.grocery_lists(user_id);
create index if not exists idx_ai_cache_hash on public.ai_cache(request_hash);
create index if not exists idx_ai_cache_expires on public.ai_cache(expires_at);
create index if not exists idx_ai_cache_user_expires on public.ai_cache(user_id, expires_at);

-- 6) SECURITY DEFINER FUNCTIONS

-- AI usage increment function (for authenticated users)
create or replace function public.increment_ai_usage(user_id uuid, increment_by int default 1)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update profiles
  set
    ai_generations_used = coalesce(ai_generations_used, 0) + increment_by,
    updated_at = now()
  where id = user_id;
end;
$$;

grant execute on function public.increment_ai_usage(uuid, int) to authenticated;

-- AI cache cleanup function (for automated cleanup)
create or replace function public.cleanup_expired_ai_cache()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from ai_cache where expires_at < now();
end;
$$;

revoke all on function public.cleanup_expired_ai_cache() from public;
grant execute on function public.cleanup_expired_ai_cache() to authenticated;

-- 7) AUTOMATED CLEANUP SCHEDULING

-- Enable pg_cron extension
create extension if not exists pg_cron;

-- Schedule daily cleanup at midnight UTC
select
  cron.schedule(
    'daily_ai_cache_cleanup',
    '0 0 * * *',
    $$select public.cleanup_expired_ai_cache();$$
  );

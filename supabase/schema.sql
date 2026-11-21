-- MINDI Mầm Vui: one private plant per anonymous Supabase user.
-- Apply in Supabase SQL Editor after enabling Anonymous Sign-Ins.
create table if not exists public.user_plants (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plant_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_plants_data_is_object check (jsonb_typeof(plant_data) = 'object')
);

alter table public.user_plants enable row level security;
alter table public.user_plants force row level security;

drop policy if exists "Users can read their own plant" on public.user_plants;
create policy "Users can read their own plant"
  on public.user_plants for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own plant" on public.user_plants;
create policy "Users can create their own plant"
  on public.user_plants for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own plant" on public.user_plants;
create policy "Users can update their own plant"
  on public.user_plants for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own plant" on public.user_plants;
create policy "Users can delete their own plant"
  on public.user_plants for delete to authenticated
  using (auth.uid() = user_id);

revoke all on public.user_plants from anon, public;
grant select, insert, update, delete on public.user_plants to authenticated;

comment on table public.user_plants is 'Private MINDI Mầm Vui player state. One row per Supabase Auth user; RLS isolates every plant.';


-- Public leaderboard: only opt-in display names and weekly points are exposed.
create table if not exists public.leaderboard_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  is_opted_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leaderboard_display_name_length check (char_length(display_name) between 2 and 20),
  constraint leaderboard_display_name_safe check (display_name ~ '^[[:alnum:] _-]+$')
);

create table if not exists public.daily_care_events (
  user_id uuid not null references auth.users(id) on delete cascade,
  care_date date not null,
  created_at timestamptz not null default now(),
  primary key (user_id, care_date)
);

alter table public.leaderboard_profiles enable row level security;
alter table public.leaderboard_profiles force row level security;
alter table public.daily_care_events enable row level security;
alter table public.daily_care_events force row level security;

drop policy if exists "Users can read own leaderboard profile" on public.leaderboard_profiles;
create policy "Users can read own leaderboard profile"
  on public.leaderboard_profiles for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own leaderboard profile" on public.leaderboard_profiles;
create policy "Users can insert own leaderboard profile"
  on public.leaderboard_profiles for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own leaderboard profile" on public.leaderboard_profiles;
create policy "Users can update own leaderboard profile"
  on public.leaderboard_profiles for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Daily events are intentionally inaccessible to direct client writes/reads.
revoke all on public.daily_care_events from anon, authenticated, public;
revoke all on public.leaderboard_profiles from anon, public;
grant select, insert, update on public.leaderboard_profiles to authenticated;

-- Server-authoritative daily check-in. A user can earn at most one point per
-- Vietnam calendar date. The unique key also protects against rapid duplicate clicks.
create or replace function public.record_daily_care()
returns table (accepted boolean, care_date date, weekly_points integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_date date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
  v_monday date;
  v_inserted integer;
  v_points integer;
begin
  if v_user is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  v_monday := v_date - (extract(isodow from v_date)::integer - 1);

  insert into public.daily_care_events(user_id, care_date)
  values (v_user, v_date)
  on conflict (user_id, care_date) do nothing;

  get diagnostics v_inserted = row_count;
  select count(*)::integer into v_points
  from public.daily_care_events
  where user_id = v_user
    and care_date >= v_monday
    and care_date < v_monday + 7;

  return query select (v_inserted = 1), v_date, v_points;
end;
$$;

-- A user may opt in/out and choose a pseudonymous display name.
create or replace function public.set_leaderboard_opt_in(p_display_name text, p_opt_in boolean)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_name text := btrim(p_display_name);
begin
  if v_user is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if char_length(v_name) < 2 or char_length(v_name) > 20 or v_name !~ '^[[:alnum:] _-]+$' then
    raise exception 'Tên hiển thị phải có 2–20 ký tự, chỉ gồm chữ, số, khoảng trắng, _ hoặc -';
  end if;

  insert into public.leaderboard_profiles(user_id, display_name, is_opted_in, updated_at)
  values (v_user, v_name, coalesce(p_opt_in, false), now())
  on conflict (user_id) do update
    set display_name = excluded.display_name,
        is_opted_in = excluded.is_opted_in,
        updated_at = now();
  return true;
end;
$$;

-- Only opted-in pseudonyms and aggregate weekly points leave the database.
-- No UUID, email, plant state, zodiac, inventory, or timestamps are returned.
create or replace function public.get_global_leaderboard(p_limit integer default 50)
returns table (rank bigint, display_name text, weekly_points integer)
language sql
stable
security definer
set search_path = ''
as $$
  with current_week as (
    select ((now() at time zone 'Asia/Ho_Chi_Minh')::date
      - (extract(isodow from (now() at time zone 'Asia/Ho_Chi_Minh')::date)::integer - 1)) as monday
  ),
  scores as (
    select p.display_name, count(e.care_date)::integer as points
    from public.leaderboard_profiles p
    cross join current_week w
    left join public.daily_care_events e
      on e.user_id = p.user_id
     and e.care_date >= w.monday
     and e.care_date < w.monday + 7
    where p.is_opted_in = true
    group by p.user_id, p.display_name
  ),
  ranked as (
    select row_number() over (order by points desc, display_name asc) as place,
           display_name, points
    from scores
  )
  select place, display_name, points
  from ranked
  order by place
  limit greatest(1, least(coalesce(p_limit, 50), 100));
$$;

revoke all on function public.record_daily_care() from public, anon;
revoke all on function public.set_leaderboard_opt_in(text, boolean) from public, anon;
revoke all on function public.get_global_leaderboard(integer) from public, anon;
grant execute on function public.record_daily_care() to authenticated;
grant execute on function public.set_leaderboard_opt_in(text, boolean) to authenticated;
grant execute on function public.get_global_leaderboard(integer) to authenticated;

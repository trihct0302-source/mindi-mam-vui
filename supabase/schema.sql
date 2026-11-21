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

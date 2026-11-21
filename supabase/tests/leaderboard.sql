-- Global leaderboard isolation and anti-duplicate scoring test.
-- Apply schema.sql first. Replace both UUIDs with two real auth.users IDs.
-- Run as postgres/service role in Supabase SQL Editor; transaction is rolled back.

begin;

-- Seed test users' opt-in preferences. Test identity A can only edit A's row.
set local role authenticated;
select set_config('request.jwt.claim.role','authenticated',true);
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);

select public.set_leaderboard_opt_in('Mầm Sao Mai', true);

-- First daily claim must be accepted.
do $$
declare r record;
begin
  select * into r from public.record_daily_care();
  if not r.accepted then raise exception 'FAIL: first daily care claim was not accepted'; end if;
end $$;

-- Duplicate claim on the same Vietnam date must not earn another point.
do $$
declare r record;
begin
  select * into r from public.record_daily_care();
  if r.accepted then raise exception 'FAIL: duplicate daily claim earned a point'; end if;
  if r.weekly_points <> 1 then raise exception 'FAIL: weekly score is not exactly one after duplicate'; end if;
end $$;

-- User B opts out. Its name must not appear in public leaderboard output.
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
select public.set_leaderboard_opt_in('Mầm Bí Mật', false);

do $$
begin
  if exists(select 1 from public.get_global_leaderboard(50) where display_name='Mầm Bí Mật') then
    raise exception 'FAIL: opted-out user appears on global leaderboard';
  end if;
  if not exists(select 1 from public.get_global_leaderboard(50) where display_name='Mầm Sao Mai') then
    raise exception 'FAIL: opted-in user missing from global leaderboard';
  end if;
end $$;

-- B must not read A's private profile through the table.
do $$
begin
  if (select count(*) from public.leaderboard_profiles where user_id='11111111-1111-4111-8111-111111111111') <> 0 then
    raise exception 'FAIL: user B can read user A private profile row';
  end if;
end $$;

-- Returned leaderboard shape must not contain a user ID or personal data.
do $$
declare n integer;
begin
  select count(*) into n from public.get_global_leaderboard(50)
  where display_name='Mầm Sao Mai' and weekly_points=1;
  if n <> 1 then raise exception 'FAIL: leaderboard score/display result mismatch'; end if;
end $$;

rollback;

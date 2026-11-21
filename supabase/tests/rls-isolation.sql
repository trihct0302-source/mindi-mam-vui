-- Manual RLS verification (run in Supabase SQL Editor as postgres).
-- This test impersonates authenticated JWT claims and checks policy behavior.
-- Run after applying ../schema.sql. Use two real anonymous auth user UUIDs
-- from Authentication > Users, replacing the two UUID literals below.

begin;
set local role authenticated;

-- Replace with two distinct auth.users.id values.
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

insert into public.user_plants(user_id, plant_data)
values ('11111111-1111-4111-8111-111111111111', '{"sign":"aries","days":[]}');

-- As user A, own row must be visible.
do $$
begin
  if (select count(*) from public.user_plants where user_id='11111111-1111-4111-8111-111111111111') <> 1 then
    raise exception 'FAIL: user A cannot read own plant';
  end if;
end $$;

-- Switch identity to user B. User A row must be invisible.
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
do $$
begin
  if (select count(*) from public.user_plants where user_id='11111111-1111-4111-8111-111111111111') <> 0 then
    raise exception 'FAIL: user B can see user A plant';
  end if;
end $$;

-- User B cannot insert a row owned by A; RLS must reject it.
do $$
begin
  begin
    insert into public.user_plants(user_id, plant_data)
    values ('11111111-1111-4111-8111-111111111111', '{"sign":"pisces"}');
    raise exception 'FAIL: user B inserted a plant for user A';
  exception when insufficient_privilege then
    raise notice 'PASS: cross-user insert rejected';
  end;
end $$;

rollback;

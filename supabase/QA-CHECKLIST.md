# Anonymous isolation QA checklist

## Backend setup
- [ ] Anonymous sign-in enabled in Supabase Auth.
- [ ] `schema.sql` applied successfully.
- [ ] RLS enabled and forced on `public.user_plants`.
- [ ] Two distinct anonymous users A and B exist in Auth.
- [ ] RLS SQL test passes with real UUIDs.

## Browser isolation
1. Open the game in a clean browser profile A; note its anonymous user UUID in Supabase Auth.
2. Choose Aries, care once, and equip one unlocked accessory (or use test data to seed inventory).
3. Open a separate clean browser profile B; confirm a different anonymous UUID is created.
4. Confirm B starts with its own default plant and cannot see A's sign, days, rewards, or equipped item.
5. Care for B and change its zodiac. Reload both profiles.
6. Confirm A retains only A's state and B retains only B's state.
7. In DevTools/network, verify requests use the authenticated session and table reads are filtered by RLS; do not rely only on client-side filters.
8. Try direct REST access using B's JWT to select/update A's row. Expect zero visible rows / policy rejection.
9. Clear browser storage in a disposable test profile and verify expected anonymous-account recovery limitation is documented.

## Migration / keep existing
- [ ] On a browser with legacy `mindi-mamvui-v1` state, first anonymous login creates a cloud row with the existing sign, days, rewards, equipped item, and rewardWeeks.
- [ ] Reload; the same anonymous session loads the cloud row.
- [ ] A second clean browser profile receives a different user ID and does not inherit the first profile's data.
- [ ] Confirm there is no shared fallback key written after migration.

## Functional regression
- [ ] Daily care remains once per Vietnam calendar day.
- [ ] Weekend reward remains once per week.
- [ ] Evolution remains at 7 / 21 / 45 care days.
- [ ] Zodiac selection and accessory selection persist.
- [ ] Offline or backend failure shows a clear sync error; no false success message.
- [ ] Mobile and desktop visual checks pass.

Do not mark this release fully accepted until backend setup and two-user isolation tests have passed.


## Global leaderboard
- [ ] User A leaves opt-in disabled: A must not appear in public leaderboard results.
- [ ] User A opts in with a pseudonym: only that display name and weekly point total appear.
- [ ] User A opts out: A disappears from leaderboard results.
- [ ] User B cannot read A's private leaderboard profile row directly.
- [ ] No email, Auth UUID, zodiac, inventory, plant JSON, or exact timestamps are exposed by leaderboard RPC.
- [ ] Call `record_daily_care()` twice on the same Vietnam date: first accepted=true, second accepted=false, weekly score remains 1.
- [ ] Two different anonymous users can each earn one point on the same date.
- [ ] Weekly score rolls over at Monday 00:00 Asia/Ho_Chi_Minh.
- [ ] Direct INSERT/UPDATE/DELETE on `daily_care_events` is denied to authenticated clients.
- [ ] `supabase/tests/leaderboard.sql` passes with two real Auth UUIDs.

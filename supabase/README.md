# Anonymous user isolation — deployment and migration

## Architecture
- GitHub Pages remains the static frontend.
- Supabase Auth creates a persistent anonymous identity for each browser profile.
- `public.user_plants` stores one plant-state row per Auth user.
- PostgreSQL Row Level Security (RLS) enforces ownership using `auth.uid() = user_id`.
- The browser never supplies an arbitrary owner identity for authorization; the session JWT is authoritative.

## Required Supabase setup
1. Create/select a Supabase project.
2. Authentication → Providers → enable **Anonymous Sign-Ins**.
3. SQL Editor: run `supabase/schema.sql`.
4. Project Settings → API: copy Project URL and publishable/anon key.
5. In GitHub repository Settings → Secrets and variables → Actions, add:
   - `SUPABASE_URL`: Supabase Project URL.
   - `SUPABASE_ANON_KEY`: publishable/anon client key.
6. The Pages workflow generates `supabase-config.js` at build time from these secrets. Do not commit the generated config or any service-role key.
7. Enable GitHub Pages deployment from `main` after review/merge.

## Keep existing progress
On first successful anonymous sign-in in a browser:
- If that anonymous user already has a cloud row, cloud state wins.
- Otherwise, the app migrates the legacy `mindi-mamvui-v1` localStorage state (or that user's namespaced local cache) into the newly created anonymous account.
- Later saves are upserted only to the authenticated user's row.
- A local cache is namespaced by Supabase user ID.

This preserves existing browser data for the first anonymous identity created on that browser. It cannot infer which human owned a shared legacy browser profile. If several people previously used the same browser profile, their old progress was already merged locally and cannot be separated reliably without a manual export/import or owner confirmation.

## RLS and security
- RLS is enabled and forced.
- SELECT/INSERT/UPDATE/DELETE policies all require `auth.uid() = user_id`.
- Table grants are limited to authenticated users.
- Never use the Supabase service-role key in frontend code.
- Do not disable RLS to make the app work.

## Verification
Run `supabase/tests/rls-isolation.sql` with two distinct Auth user UUIDs, replacing the placeholders. It checks own-row visibility, cross-user invisibility, and cross-user insert rejection. Also run the browser checklist in `supabase/QA-CHECKLIST.md`.

## Current integration limitation
The repository cannot connect to a Supabase project until the project URL/key are configured and the SQL migration is applied. Until then, the UI intentionally disables the daily-care action instead of silently writing to a shared/local fallback. Anonymous sessions are per browser profile; clearing site storage can lose the anonymous identity unless the user has an account-linking/recovery flow (not included in this V1).


## Global leaderboard
- Global leaderboard is opt-in. The default is private / not listed.
- Players choose a pseudonymous display name (2–20 alphanumeric, spaces, underscore, or hyphen).
- Only display name, rank, and current Vietnam-week point total are returned by the leaderboard RPC.
- Auth UUID, email, zodiac, plant state, inventory, and exact check-in timestamps are never exposed.
- A server-side RPC records at most one daily event per authenticated user per Vietnam date using a unique key. Weekly points are derived from those events, not client-submitted values.
- Scores reset by week (Monday 00:00 Asia/Ho_Chi_Minh).
- Run `supabase/tests/leaderboard.sql` after replacing UUID placeholders with two real anonymous Auth user IDs.

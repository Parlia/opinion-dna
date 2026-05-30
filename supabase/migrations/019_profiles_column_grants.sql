-- Restrict what `authenticated` users can UPDATE on their own profile row.
--
-- The RLS policy "Users can update own profile" only scopes WHICH row a user
-- can update (their own), not WHICH columns. With blanket UPDATE granted, a
-- custom client could overwrite any column on its own row — today that includes
-- stripe_customer_id, and any future column (admin flag, plan tier, internal
-- state) would be user-writable by default. (/cso finding A1, 2026-05-09.)
--
-- Postgres column-level privileges layer on top of RLS: revoke the table-wide
-- UPDATE and re-grant only the two columns the app legitimately lets users edit
-- from the browser (Settings page: full_name, preferred_name). RLS still ensures
-- they can only touch their own row.
--
-- Server-side writes use the service-role/secret key, which bypasses both RLS
-- and these grants, so privileged columns (stripe_customer_id) are still written
-- by trusted server code — see the admin-client write in
-- src/app/api/stripe/checkout/route.ts.

revoke update on public.profiles from authenticated;
grant update (full_name, preferred_name) on public.profiles to authenticated;

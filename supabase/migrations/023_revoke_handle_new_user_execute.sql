-- 023_revoke_handle_new_user_execute.sql
--
-- Supabase Security Advisor (lints 0028/0029): public.handle_new_user() is a
-- SECURITY DEFINER function in the public schema, so PostgREST exposes it as
-- /rest/v1/rpc/handle_new_user and the anon + authenticated roles inherit the
-- default PUBLIC EXECUTE grant — i.e. anyone can invoke a definer-rights
-- function directly over the API.
--
-- The function is ONLY meant to run as the AFTER INSERT trigger on auth.users
-- (see 014_preferred_name.sql). Trigger functions execute as the table owner
-- regardless of the invoking role's EXECUTE privilege, so revoking EXECUTE from
-- the API roles removes the RPC attack surface without affecting signup.
-- service_role retains EXECUTE (it is never exposed to untrusted clients).

revoke execute on function public.handle_new_user() from public, anon, authenticated;

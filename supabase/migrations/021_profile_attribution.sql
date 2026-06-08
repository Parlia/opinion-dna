-- Channel attribution for the admin scorecard (Phase 2).
--
-- Captures where a user came from so /admin can break revenue down by source
-- (TikTok / Instagram / referral / direct / unknown) instead of bucketing
-- everyone as "unknown". First-touch attribution: a small client cookie records
-- utm_* + the external referrer host on the first page load, and the OAuth/
-- email-confirmation callback persists it onto the profile exactly once.
--
-- All nullable text. Legacy users (signed up before capture was wired) keep
-- NULLs and surface as "unknown" on the scorecard — which is honest.
--
-- Writes go through the service-role admin client only (the /callback route).
-- Migration 019 revoked table-wide UPDATE on profiles from `authenticated` and
-- re-granted only (full_name, preferred_name), so these columns are NOT
-- user-writable from the browser. Do NOT add a grant for them.

alter table public.profiles
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists referrer text,
  add column if not exists landing_path text;

comment on column public.profiles.utm_source is
  'First-touch utm_source captured at signup. Normalized into a channel bucket on the admin scorecard. Service-role write only.';
comment on column public.profiles.landing_path is
  'First-touch landing path. Its presence marks a user whose attribution was captured (distinguishes "direct" from "unknown").';

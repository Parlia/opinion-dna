-- Internal/test account flag for the admin scorecard.
--
-- The admin dashboard's headline numbers (revenue, paid-conversion) were being
-- contaminated by test accounts and the founders' own comped rows. A "real sale"
-- needs to exclude these, and the funnel's "Paid" step must count real buyers
-- only. We add an explicit per-profile flag rather than re-deriving from an email
-- allowlist on every request: the flag is editable from the admin UI (toggle in
-- the users table) so new testers/friendlies can be marked without a code change.
--
-- Source of truth is this column. The seed UPDATE below flags the accounts we
-- already know are internal (founders, +test aliases, @neeleyworldwide.com,
-- odna.testflow*, the friendly early tester) so the flag is correct on day one.
--
-- Writes go through the service-role admin client only (POST /api/admin/set-internal).
-- Migration 019 already revoked table-wide UPDATE on profiles from `authenticated`
-- and re-granted only (full_name, preferred_name), so is_internal is NOT
-- user-writable from the browser — no extra grant needed here, and we must not
-- add one.

alter table public.profiles
  add column if not exists is_internal boolean not null default false;

-- Seed the flag for accounts we already know are internal/test. Profiles has no
-- email column, so join auth.users. Idempotent (re-running just re-sets true).
update public.profiles p
set is_internal = true
from auth.users u
where u.id = p.id
  and (
    u.email ilike '%@neeleyworldwide.com'
    or u.email ilike '%+test%'         -- jpaulneeley+test@, +test2, +test3, ...
    or u.email ilike 'odna.testflow%'  -- odna.testflow.2024@gmail.com
    or u.email in (
      'jpaulneeley@gmail.com',         -- admin (J. Paul)
      'tmunthe@gmail.com',             -- founder (Turi Munthe)
      'ewortham6@gmail.com',           -- founder
      'alessandramillar@gmail.com'     -- early friendly tester
    )
  );

comment on column public.profiles.is_internal is
  'Internal/test/founder account. Excluded from real-sale and funnel totals on the admin scorecard. Editable from the admin UI; service-role write only.';

-- Lifecycle email bookkeeping + phantom report cleanup.
--
-- 1) Two write-once timestamps on profiles, used as idempotency claims by
--    the welcome email (callback route) and the abandoned-quiz nudge (cron).
--    Migration 019 already revoked blanket UPDATE on profiles from
--    `authenticated` and re-granted only (full_name, preferred_name), so
--    these columns are service-role-writable only — no extra grants needed.
alter table public.profiles
  add column if not exists welcome_email_sent_at timestamptz,
  add column if not exists quiz_nudge_sent_at timestamptz;

comment on column public.profiles.welcome_email_sent_at is
  'Set by the auth callback when the one-time welcome email is claimed/sent.';
comment on column public.profiles.quiz_nudge_sent_at is
  'Set by /api/cron/quiz-nudge when the one-time abandoned-quiz email is claimed/sent.';

-- 2) Clean up phantom comparison reports left by the old quiz-submit trigger
--    (removed June 2026). That path inserted reports with status "generating"
--    and NO relationship_type, then never generated content. Real generation
--    (generate-comparison.ts) always sets relationship_type, and its stale
--    sweep filters on relationship_type — so these rows were invisible to it
--    and sat in "generating" forever.
update public.reports
set status = 'failed'
where type = 'comparison'
  and status = 'generating'
  and relationship_type is null;

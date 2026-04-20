-- Wave C hardening: Stripe webhook idempotency + query performance indexes.

-- Idempotency for Stripe webhook: Stripe can redeliver checkout.session.completed
-- up to 72 hours. Without a unique constraint on stripe_session_id a replay would
-- insert a duplicate purchase row. Existing rows with NULL stripe_session_id are
-- unaffected (the unique constraint allows multiple NULLs).
create unique index if not exists idx_purchases_stripe_session_unique
  on public.purchases (stripe_session_id)
  where stripe_session_id is not null;

-- Composite indexes for the queries that run on hot paths. These are no-ops when
-- the table is small but become meaningful as we grow.

-- /compare dashboard filters invites by recipient + status.
create index if not exists idx_invites_to_user_status
  on public.invites (to_user_id, status)
  where to_user_id is not null;

-- /compare dashboard also filters by sender + status.
create index if not exists idx_invites_from_user_status
  on public.invites (from_user_id, status);

-- Comparison selection lookups by invite.
create index if not exists idx_comparison_selections_invite_type
  on public.comparison_selections (invite_id, relationship_type);

-- Report list queries filter by user + type + status (e.g. latest personal report).
create index if not exists idx_reports_user_type_status
  on public.reports (user_id, type, status);

-- Purchase lookups by user + type + status (e.g. has completed personal purchase).
create index if not exists idx_purchases_user_type_status
  on public.purchases (user_id, type, status);

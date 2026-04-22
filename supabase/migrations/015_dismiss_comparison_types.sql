-- Let users dismiss comparison types they'll never want for a given invite
-- (e.g. "Couples" with a co-founder, "Co-Founders" with a partner). One row
-- per (invite, relationship_type) already thanks to the unique index in
-- 011_comparison_selections, so dismissal just flips two fields on a row
-- that's otherwise empty (selected_by is still required — we set it to the
-- user who dismissed, and the pricing + UI filter those rows out).
--
-- Shared between the pair: whichever participant dismisses first, the type
-- is hidden from both sides. Undismissing isn't exposed in the UI yet — if
-- a pair changes its mind they can re-invite; worth revisiting if this
-- causes friction in practice.

alter table public.comparison_selections
  add column dismissed_at timestamptz,
  add column dismissed_by uuid references auth.users(id);

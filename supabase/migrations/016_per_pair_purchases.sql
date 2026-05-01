-- Per-pair purchase enforcement
--
-- Before this migration a single completed couples_comparison /
-- cofounders_comparison purchase silently backed every future
-- comparison_selections row of the same type — the Compare page showed
-- "Paid" and skipped Stripe for partners the user never paid for.
--
-- We now require one purchase per (partner, relationship_type) pair.

-- Auto-undo: delete unconfirmed/un-reported selections whose purchase_id is
-- shared with an earlier-created selection. Restores the rows that silently
-- reused another comparison's purchase so the user can re-select them with
-- a fresh Stripe checkout. Confirmed/completed rows are preserved even if
-- they share a purchase_id (the report was delivered, refunding it is a
-- separate decision).
delete from public.comparison_selections cs
using public.comparison_selections earlier
where cs.purchase_id is not null
  and cs.purchase_id = earlier.purchase_id
  and earlier.created_at < cs.created_at
  and cs.confirmed_by is null
  and cs.report_id is null;

-- Enforce: each purchase backs at most one selection. Partial index leaves
-- friends-type rows (purchase_id null) unconstrained.
create unique index comparison_selections_purchase_id_unique
  on public.comparison_selections(purchase_id)
  where purchase_id is not null;

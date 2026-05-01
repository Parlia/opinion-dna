-- Backfill purchase_id on legacy comparison_selections rows.
--
-- Migration 011 backfilled comparison_selections from historical invites
-- without copying the purchase_id, leaving completed reports with no
-- attached purchase. The new per-pair pricing logic in 016 then treats
-- those purchases as "unconsumed credits" the user can spend on a new
-- pair — exactly the bug we're trying to kill.
--
-- This migration retroactively binds each orphan completed comparison
-- purchase to a legacy report by the same user, in created_at order.
-- Any orphans left over after pairing (duplicate charges, failed flows)
-- stay orphaned and need manual disposition (Stripe refund + status
-- update) — flagging that is a UI / human decision, not migration work.

with orphan_purchases as (
  select
    p.id,
    p.user_id,
    p.type,
    p.created_at,
    row_number() over (
      partition by p.user_id, p.type
      order by p.created_at
    ) as rn
  from public.purchases p
  where p.status = 'completed'
    and p.type in ('couples_comparison', 'cofounders_comparison')
    and not exists (
      select 1
      from public.comparison_selections cs
      where cs.purchase_id = p.id
    )
),
legacy_selections as (
  select
    cs.id,
    cs.selected_by,
    cs.relationship_type,
    cs.created_at,
    row_number() over (
      partition by cs.selected_by, cs.relationship_type
      order by cs.created_at
    ) as rn
  from public.comparison_selections cs
  where cs.purchase_id is null
    and cs.report_id is not null
    and cs.relationship_type in ('couples', 'cofounders')
)
update public.comparison_selections cs
set purchase_id = pairing.purchase_id,
    updated_at  = now()
from (
  select
    ls.id          as selection_id,
    op.id          as purchase_id
  from legacy_selections ls
  join orphan_purchases op
    on op.user_id = ls.selected_by
   and op.rn      = ls.rn
   and (
     (ls.relationship_type = 'couples'    and op.type = 'couples_comparison') or
     (ls.relationship_type = 'cofounders' and op.type = 'cofounders_comparison')
   )
) as pairing
where cs.id = pairing.selection_id;

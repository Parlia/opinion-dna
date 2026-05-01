-- Backfill purchase_id on legacy comparison_selections rows.
--
-- Migration 011 backfilled comparison_selections from historical invites
-- without copying the purchase_id, leaving completed reports with no
-- attached purchase. The new per-pair pricing logic in 016 then treats
-- those purchases as "unconsumed credits" the user can spend on a new
-- pair — exactly the bug we're trying to kill.
--
-- This migration retroactively binds each orphan completed comparison
-- purchase to a legacy report. Matching rules:
--   1. The purchase user must be EITHER party of the selection's invite
--      (selected_by isn't reliable on legacy rows — invites went both
--      directions and the per-pair payer wasn't always the selector).
--   2. The product type must match the relationship_type.
--   3. Selections are processed oldest-first so they get first dibs.
--   4. Within a selection, prefer the inviter's purchase, then the
--      earliest purchased_at.
--   5. A purchase already attached to another selection (incl. one
--      attached earlier in this same loop) is skipped — no double-bind.
--
-- Any orphan purchases left over after this loop have no legacy report
-- to belong to (true duplicates / failed flows). They stay orphaned and
-- need manual disposition (Stripe refund + status update). Surfacing
-- those is a UI / human decision, not migration work.

do $$
declare
  sel record;
  match_id uuid;
begin
  for sel in
    select
      cs.id,
      cs.relationship_type,
      i.from_user_id,
      i.to_user_id,
      cs.created_at
    from public.comparison_selections cs
    join public.invites i on i.id = cs.invite_id
    where cs.purchase_id is null
      and cs.report_id is not null
      and cs.relationship_type in ('couples', 'cofounders')
    order by cs.created_at
  loop
    select p.id
    into match_id
    from public.purchases p
    where p.status = 'completed'
      and p.user_id in (sel.from_user_id, sel.to_user_id)
      and (
        (sel.relationship_type = 'couples'    and p.type = 'couples_comparison') or
        (sel.relationship_type = 'cofounders' and p.type = 'cofounders_comparison')
      )
      and not exists (
        select 1
        from public.comparison_selections cs2
        where cs2.purchase_id = p.id
      )
    order by
      case when p.user_id = sel.from_user_id then 0 else 1 end,
      p.created_at
    limit 1;

    if match_id is not null then
      update public.comparison_selections
      set purchase_id = match_id,
          updated_at  = now()
      where id = sel.id;
    end if;
  end loop;
end
$$;

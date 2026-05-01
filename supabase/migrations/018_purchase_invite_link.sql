-- Tag comparison purchases with the (invite, relationship_type) they were
-- bought for. We already pass these through Stripe metadata; storing them on
-- the purchase row directly lets the pricing endpoint distinguish "partner
-- paid for THIS pair" from "partner has an unrelated unconsumed purchase",
-- which kills the race-window false positive where a fresh Stripe redirect
-- back from the partner makes the OTHER pair show "X has paid — waiting to
-- confirm" before the matching selection row lands.
--
-- Nullable so legacy purchases without metadata stay valid; new comparison
-- purchases always carry both. Personal purchases leave both null.

alter table public.purchases
  add column if not exists invite_id uuid references public.invites(id) on delete set null,
  add column if not exists relationship_type text
    check (relationship_type is null or relationship_type in ('couples', 'cofounders', 'friends'));

create index if not exists idx_purchases_invite_id
  on public.purchases(invite_id);

-- Backfill: any comparison purchase already bound to a comparison_selections
-- row inherits the selection's invite_id and relationship_type so the
-- "partner paid for this pair" check works for historical data too.
update public.purchases p
set invite_id = cs.invite_id,
    relationship_type = cs.relationship_type
from public.comparison_selections cs
where cs.purchase_id = p.id
  and p.invite_id is null;

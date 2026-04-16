-- Dual-consent comparison selections: one row per (invite, relationship_type)
-- Enables multiple report types per invite and requires both parties to agree

create table public.comparison_selections (
  id uuid default gen_random_uuid() primary key,
  invite_id uuid references public.invites(id) on delete cascade not null,
  relationship_type text not null
    check (relationship_type in ('couples', 'cofounders', 'friends')),

  -- Who initiated the selection
  selected_by uuid references auth.users(id) not null,
  selected_at timestamptz default now() not null,

  -- Partner confirmation (null until confirmed)
  confirmed_by uuid references auth.users(id),
  confirmed_at timestamptz,

  -- Payment (null for free types like friends)
  purchase_id uuid references public.purchases(id),

  -- Report (set after generation completes)
  report_id uuid references public.reports(id),
  compatibility_score integer,

  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  -- One selection per (invite, relationship_type)
  unique (invite_id, relationship_type)
);

-- Indexes
create index idx_comparison_selections_invite on public.comparison_selections(invite_id);
create index idx_comparison_selections_selected_by on public.comparison_selections(selected_by);

-- Backfill from existing invites that already have a comparison report
insert into public.comparison_selections (
  invite_id, relationship_type, selected_by, selected_at,
  confirmed_by, confirmed_at, report_id, compatibility_score
)
select
  i.id,
  coalesce(i.relationship_type, 'cofounders'),
  i.from_user_id,
  i.updated_at,
  i.to_user_id,
  i.updated_at,
  i.comparison_report_id,
  i.compatibility_score
from public.invites i
where i.comparison_report_id is not null
on conflict (invite_id, relationship_type) do nothing;

-- Enable RLS
alter table public.comparison_selections enable row level security;

-- Users can read selections for invites they participate in
create policy "Users can view own selections"
  on public.comparison_selections for select
  using (
    invite_id in (
      select id from public.invites
      where from_user_id = auth.uid() or to_user_id = auth.uid()
    )
  );

-- Users can insert selections for invites they participate in
create policy "Users can create selections"
  on public.comparison_selections for insert
  with check (
    selected_by = auth.uid()
    and invite_id in (
      select id from public.invites
      where (from_user_id = auth.uid() or to_user_id = auth.uid())
        and status = 'accepted'
    )
  );

-- Users can update selections they participate in (for confirmation)
create policy "Users can confirm selections"
  on public.comparison_selections for update
  using (
    invite_id in (
      select id from public.invites
      where from_user_id = auth.uid() or to_user_id = auth.uid()
    )
  );

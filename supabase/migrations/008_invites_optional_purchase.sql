-- Make purchase_id optional (invites are free, comparison is the paid action)
alter table public.invites alter column purchase_id drop not null;

-- Add comparison tracking columns
alter table public.invites add column if not exists comparison_report_id uuid references public.reports(id);
alter table public.invites add column if not exists compatibility_score integer;

-- Add share columns to reports for dual-consent sharing
alter table public.reports add column if not exists share_token text unique;
alter table public.reports add column if not exists share_approved_by uuid[] default '{}';

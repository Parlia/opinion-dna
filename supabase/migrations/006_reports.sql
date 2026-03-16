-- Reports: AI-generated reports
create type report_status as enum ('generating', 'completed', 'failed');

create table public.reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null default 'personal' check (type in ('personal', 'comparison')),
  content text,
  pdf_url text,
  scores_snapshot integer[],
  comparison_user_id uuid references auth.users(id),
  comparison_scores_snapshot integer[],
  status report_status default 'generating' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_reports_user on public.reports(user_id);

-- RLS
alter table public.reports enable row level security;

create policy "Users can view own reports"
  on public.reports for select
  using (auth.uid() = user_id or auth.uid() = comparison_user_id);

-- Service role manages reports (generation API)
create policy "Service role can manage reports"
  on public.reports for all
  using (auth.role() = 'service_role');

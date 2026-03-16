-- Profiles table: extends auth.users
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  stripe_customer_id text unique,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
-- Purchases table: tracks Stripe payments
create type purchase_type as enum ('personal', 'couples', 'cofounders', 'teams', 'coaching');
create type purchase_status as enum ('pending', 'completed', 'refunded');

create table public.purchases (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type purchase_type not null,
  status purchase_status default 'pending' not null,
  stripe_session_id text,
  stripe_payment_intent_id text,
  amount_cents integer not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_purchases_user_id on public.purchases(user_id);
create index idx_purchases_stripe_session on public.purchases(stripe_session_id);

-- RLS
alter table public.purchases enable row level security;

create policy "Users can view own purchases"
  on public.purchases for select
  using (auth.uid() = user_id);

-- Service role can insert/update (webhooks)
create policy "Service role can manage purchases"
  on public.purchases for all
  using (auth.role() = 'service_role');
-- Quiz responses: individual answers
create table public.quiz_responses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  question_index integer not null check (question_index >= 0 and question_index <= 178),
  answer integer not null check (answer >= 1 and answer <= 5),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (user_id, question_index)
);

create index idx_quiz_responses_user on public.quiz_responses(user_id);

-- RLS
alter table public.quiz_responses enable row level security;

create policy "Users can view own responses"
  on public.quiz_responses for select
  using (auth.uid() = user_id);

create policy "Users can insert own responses"
  on public.quiz_responses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own responses"
  on public.quiz_responses for update
  using (auth.uid() = user_id);
-- User scores: computed 48-element array
create table public.user_scores (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  scores integer[] not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS
alter table public.user_scores enable row level security;

create policy "Users can view own scores"
  on public.user_scores for select
  using (auth.uid() = user_id);

create policy "Users can upsert own scores"
  on public.user_scores for insert
  with check (auth.uid() = user_id);

create policy "Users can update own scores"
  on public.user_scores for update
  using (auth.uid() = user_id);

-- Service role can manage (for quiz submit API)
create policy "Service role can manage scores"
  on public.user_scores for all
  using (auth.role() = 'service_role');
-- Population averages: running mean of all user scores
create table public.population_averages (
  id uuid default gen_random_uuid() primary key,
  averages integer[] not null,
  sample_size integer not null default 0,
  updated_at timestamptz default now() not null
);

-- RLS
alter table public.population_averages enable row level security;

-- Anyone can read population averages
create policy "Anyone can view population averages"
  on public.population_averages for select
  using (true);

-- Only service role can modify
create policy "Service role can manage averages"
  on public.population_averages for all
  using (auth.role() = 'service_role');
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
-- Invites: comparison sharing
create type invite_status as enum ('pending', 'accepted', 'expired', 'declined');

create table public.invites (
  id uuid default gen_random_uuid() primary key,
  from_user_id uuid references auth.users(id) on delete cascade not null,
  to_email text not null,
  to_user_id uuid references auth.users(id),
  token text not null unique,
  type purchase_type not null,
  status invite_status default 'pending' not null,
  purchase_id uuid references public.purchases(id) not null,
  expires_at timestamptz not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_invites_token on public.invites(token);
create index idx_invites_from_user on public.invites(from_user_id);
create index idx_invites_to_email on public.invites(to_email);

-- RLS
alter table public.invites enable row level security;

create policy "Users can view invites they sent"
  on public.invites for select
  using (auth.uid() = from_user_id);

create policy "Users can view invites sent to them"
  on public.invites for select
  using (auth.uid() = to_user_id);

create policy "Users can insert invites"
  on public.invites for insert
  with check (auth.uid() = from_user_id);

create policy "Users can update invites sent to them"
  on public.invites for update
  using (auth.uid() = to_user_id);

-- Service role can manage all
create policy "Service role can manage invites"
  on public.invites for all
  using (auth.role() = 'service_role');

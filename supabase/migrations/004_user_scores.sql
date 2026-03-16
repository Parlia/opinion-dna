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

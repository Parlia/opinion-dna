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

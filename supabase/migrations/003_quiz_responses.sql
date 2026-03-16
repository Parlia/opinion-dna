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

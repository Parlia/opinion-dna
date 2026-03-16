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

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

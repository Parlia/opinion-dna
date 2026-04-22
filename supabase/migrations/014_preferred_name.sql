-- Preferred name for reports. full_name stays as the formal name used on
-- receipts / compliance; preferred_name is what Claude addresses the user as
-- in narrative sections of personal + comparison reports. Nullable; callers
-- fall back to full_name when it's not set.

alter table public.profiles
  add column preferred_name text;

-- Extend the auto-create trigger so new signups that pass preferred_name in
-- options.data (signup form, future quiz step, etc.) have it persisted on
-- first run. Existing rows are backfilled via Settings, not retroactively.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, preferred_name)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'preferred_name'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = '';

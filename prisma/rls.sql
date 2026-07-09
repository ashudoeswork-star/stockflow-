-- Run this in the Supabase SQL editor AFTER `npm run db:push` has created the tables.
-- Prisma manages table structure; RLS policies are managed here since Prisma doesn't
-- generate Postgres row-level security.

alter table organizations enable row level security;
alter table profiles enable row level security;
alter table products enable row level security;
alter table stock_movements enable row level security;

-- Profiles: a user can read profiles in their own org, and read/update their own row.
create policy "read own org profiles" on profiles
  for select using (
    organization_id = (select organization_id from profiles where id = auth.uid())
  );

create policy "update own profile" on profiles
  for update using (id = auth.uid());

-- Organizations: a user can read their own org.
create policy "read own organization" on organizations
  for select using (
    id = (select organization_id from profiles where id = auth.uid())
  );

-- Products: scoped to the user's organization, full CRUD for now.
-- (Role-based write restrictions — e.g. only ADMIN can delete — come once
-- the Role enum is actually enforced in the UI, around Day 4-5.)
create policy "org members manage products" on products
  for all using (
    organization_id = (select organization_id from profiles where id = auth.uid())
  );

-- Stock movements: scoped to the user's organization, full CRUD for now.
create policy "org members manage stock movements" on stock_movements
  for all using (
    organization_id = (select organization_id from profiles where id = auth.uid())
  );

-- Auto-create a profile row whenever a new Supabase auth user is created.
-- Note: this assigns every new signup to a single default organization.
-- That's fine for Day 1 (one company, invite-only). Once you have multiple
-- tenant companies, replace this with an invite-token flow.
create or replace function public.handle_new_user()
returns trigger as $$
declare
  default_org_id uuid;
begin
  select id into default_org_id from organizations limit 1;

  insert into public.profiles (id, email, organization_id)
  values (new.id, new.email, default_org_id);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

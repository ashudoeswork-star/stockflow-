# StockFlow — Day 1

Foundation: auth, database schema, protected routes, app shell. No product
or stock features yet — those land Day 2 onward.

## What's actually here

- Email/password login via Supabase Auth, with middleware-protected routes
- Prisma schema for `Product` and `StockMovement`, organization-scoped
  (multi-tenancy is built into the data model now so it's not a rewrite later)
- Dashboard shell with sidebar nav (Products page is a stub, rest are
  greyed out until their day)
- Row-level security policies so org A can never see org B's data

## Setup (15-20 min, one time)

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a free project, and grab:
- Project URL
- `anon` public key
- Database connection string (Settings → Database → Connection string → URI,
  use the **Transaction pooler** one for serverless)

### 2. Install dependencies

```bash
npm install
```

### 3. Set environment variables

```bash
cp .env.local.example .env.local
```

Fill in the three values from step 1.

### 4. Push the schema to your database

```bash
npm run db:generate
npm run db:push
```

This creates the `organizations`, `profiles`, `products`, and
`stock_movements` tables.

### 5. Enable row-level security

Open the Supabase SQL editor and run the contents of `prisma/rls.sql`.
This also sets up a trigger so new signups auto-get a profile row.

### 6. Create your first organization + user

In the SQL editor:

```sql
insert into organizations (name) values ('My Distribution Co');
```

Then go to **Authentication → Users → Add user** in the Supabase dashboard,
create yourself a user with an email/password. The trigger from step 5 will
automatically create a matching `profiles` row linked to the organization
you just created.

### 7. Run it

```bash
npm run dev
```

Visit `localhost:3000`, sign in with the user you just created.

## What you should see

Login page → redirected to `/dashboard` → sidebar showing Dashboard
(live) and Products (stub), with Stock movements / Purchase orders /
Sales orders greyed out and labeled with their build day.

## Next: Day 2

Build out `/products` — the add/edit/search SKU catalog using the
`Product` model that's already in `prisma/schema.prisma`. Ping me when
you're ready and I'll generate that page.

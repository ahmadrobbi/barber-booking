This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment Variables

Copy `.env.local` and fill in your values:

```bash
cp .env.local .env.local.example
```

### Required Environment Variables:

1. **SUPABASE_URL** - Your Supabase project URL
   - Get from: Supabase Dashboard → Settings → API → Project URL

2. **SUPABASE_SERVICE_ROLE_KEY** - Your Supabase service role key
   - Get from: Supabase Dashboard → Settings → API → service_role key
   - ⚠️ **Important**: Never commit this key to version control

3. **FONNTE_TOKEN** - Your Fonnte WhatsApp API token
   - Get from: Fonnte Dashboard → API Settings

### Setup Steps:

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the migrations in `supabase/migrations/` to set up your database
3. Copy the environment variables to `.env.local`
4. Start the development server: `npm run dev`

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Supabase migrations

This repo now includes an incremental migration in `supabase/migrations/` and a GitHub Actions workflow in `.github/workflows/supabase-db-push.yml`.

To enable automatic migration on every push to `main`, add these GitHub repository secrets:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_PROJECT_REF`

The workflow will:

1. Install the Supabase CLI
2. Link the repository to your Supabase project
3. Run `supabase db push` so unapplied migrations are executed remotely

The included migration for `dashboard_users` is idempotent, so it safely adds `no_hp` only if the column does not already exist.

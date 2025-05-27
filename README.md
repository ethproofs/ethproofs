[![Netlify Status](https://api.netlify.com/api/v1/badges/6aef8d9a-757e-4588-9cde-8864c655dfd5/deploy-status?branch=main)](https://app.netlify.com/sites/ethproofs/deploys?branch=main)

<div align="center" style="margin-top: 1em; margin-bottom: 3em;">
  <a href="https://ethproofs.org"><img alt="ethproofs hero and logo" src="./public/images/social-preview.png" alt="ethproofs.org"></a>
</div>

# Ethproofs

## App local development

```bash
pnpm install
pnpm dev
```

## Supabase local development

Install the [supabase CLI](https://supabase.com/docs/guides/cli/getting-started) & [docker](https://docs.docker.com/get-started/get-docker/).

```bash
supabase login
supabase start
```

Create a `.env.local` file with the generated API URL and anon key.

```bash
NEXT_PUBLIC_SUPABASE_URL=the-generated-API-URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=the-generated-anon-key
```

### Supabase migrations workflow

See https://supabase.com/docs/guides/cli/local-development#database-migrations

### Supabase seed workflow

See https://supabase.com/docs/guides/cli/local-development#database-seeds

### Typescript

After a change in the database schema, run the following command to regenerate the typescript types.

```bash
pnpm db:types
```

More info: https://supabase.com/docs/reference/javascript/typescript-support

### Seed

Generate the seed file by running the script and then reset the database.

The script will automatically install dependencies and pipe the results into `supabase/seed.sql`.

```bash
pnpm db:seed
pnpm db:reset
```

Sync the database schema with the seed file.

```bash
pnpm seed:sync
```

## Cron jobs

This project uses the [`pg_cron`](https://supabase.com/docs/guides/database/extensions/pgcron) extension in Supabase to automate important database maintenance tasks.  
**You must ensure that the Cron extension is installed and enabled in your Supabase project** for these jobs to run correctly.

### Requirements

1. **Install the pg_cron extension**  
   Follow the [Supabase pg_cron documentation](https://supabase.com/docs/guides/database/extensions/pgcron) to enable the extension in your project.

2. **Schedule the required jobs**  
   Use the SQL commands below to schedule each job in your Supabase database.

---

### List of required cron jobs

- **Update cluster active status daily**  
  Updates the `is_active` status of clusters every day at midnight:
  ```sql
  select cron.schedule(
      'update-cluster-active-status',
      '0 0 * * *',
      'select update_cluster_active_status();'
  );
  ```

More info: https://supabase.com/docs/guides/cron

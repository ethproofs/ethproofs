# ethproofs

## App local development

```bash
pnpm install
pnpm dev
```

## Supabase local development

Install the [supabase CLI](https://supabase.com/docs/guides/cli/getting-started) & [docker](https://docs.docker.com/get-started/get-docker/).

```bash
supabase login
supabase link --project-ref ibkqxhjnroghhtfyualc
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

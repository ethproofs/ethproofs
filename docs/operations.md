# Operations & Runbook

Day-to-day operational knowledge: setup, the database workflow, deploys, cron jobs, and
the one-off scripts. This complements the root `README.md` and `CONTRIBUTING.md` (don't
duplicate — read those too).

## Local setup

```bash
pnpm install                # also installs husky git hooks (commitlint)
supabase start              # local Postgres + Studio (requires Docker + supabase CLI)
pnpm dev                    # Next.js dev server (clears .next cache first, uses Turbopack)
```

After `supabase start`, copy the printed API URL and anon key into `.env.local`.

### Environment variables

From `.env.example`:

| Var                                                  | Purpose                                  |
| ---------------------------------------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase client (browser/anon)    |
| `SUPABASE_SERVICE_KEY`                               | Service-role key (server scripts)        |
| `DATABASE_URL`                                       | Postgres connection (direct or pooler)   |
| `RPC_URL`, `RPC_URL_FALLBACK`                        | Ethereum RPC for block data              |
| `SITE_URL`                                           | Site URL override                        |
| `SECRET`                                             | Secret for API auth tokens               |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`             | Error/alert reporting                    |
| `EMAIL_FROM`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Transactional email (AWS SES) |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Rate limiting (referenced in middleware) |
| `GHOST_URL`, `GHOST_CONTENT_KEY`                     | Blog content (referenced in `lib/ghost.ts`) |

> Some vars (Upstash, Ghost) aren't in `.env.example` but are read by the code — grab
> their values from the deployment environment when you set up production-like local
> runs. Rate limiting fails open if Redis is missing, so the app still runs locally
> without Upstash.

### Useful scripts (`package.json`)

| Command            | Does                                                          |
| ------------------ | ------------------------------------------------------------ |
| `pnpm dev`         | Dev server                                                   |
| `pnpm build`       | Production build (runs `postbuild`: sitemap + API docs)      |
| `pnpm typecheck`   | `tsc --noEmit`                                               |
| `pnpm lint` / `lint:fix` | ESLint                                                 |
| `pnpm format`      | Prettier                                                     |
| `pnpm db:start` / `db:stop` / `db:reset` | Supabase lifecycle                     |
| `pnpm db:types`    | Regenerate `lib/database.types.ts` from the local DB         |
| `pnpm db:seed`     | Generate `supabase/seed.sql` from `supabase/seed/seed.ts`    |
| `pnpm seed:sync`   | Sync schema with the seed file                               |
| `pnpm api:docs`    | Regenerate OpenAPI JSON + `public/api.html`                  |
| `pnpm storybook`   | Component explorer                                           |

## Database workflow (Drizzle + Supabase)

The schema is defined in **`db/schema.ts`** (Drizzle). Migrations are SQL files under
`supabase/migrations/` with a snapshot in `supabase/migrations/meta/`.

**Schema changes** (new table/column/constraint) — let Drizzle Kit generate both the SQL
and the snapshot:

```bash
npx drizzle-kit generate --name <description>
```

**Data-only migrations** (no schema change) — use `--custom` for an empty SQL file:

```bash
npx drizzle-kit generate --custom --name <description>
```

If you ever hand-write a schema change with `--custom`, you must manually update the
snapshot under `supabase/migrations/meta/` or future generations drift. (This is all
restated in the root `CLAUDE.md` — follow it exactly.)

After any schema change, regenerate types:

```bash
pnpm db:types
```

Apply migrations locally with `pnpm db:reset` (resets + replays migrations + seed).

### Seeding

```bash
pnpm db:seed      # runs supabase/seed/seed.ts, writes supabase/seed.sql
pnpm db:reset     # replays schema + seed
pnpm seed:sync    # sync DB schema with the seed file
```

## API tokens

The public API is gated by hashed tokens in `api_auth_tokens`. Tokens are created with
`scripts/create-key.ts`:

```bash
npx tsx scripts/create-key.ts
```

> ⚠️ This script is explicitly a **temporary manual tool** (`TODO:TEAM - replace with a
> proper auth system`). It generates a `nanoid`, hashes it via `lib/auth/hash-token.ts`,
> and inserts a row — but the `user_id` is a hardcoded `"..."` placeholder and `mode` is
> `"all"`. **Edit the script** to set a real `user_id`/`mode` before running, and capture
> the printed plaintext token (it's only shown once; only the hash is stored). Needs
> `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in the environment.

## Cron jobs (pg_cron)

Scheduled work runs **inside Postgres** via `pg_cron`, scheduled in migrations. The
`pg_cron` extension must be enabled in the Supabase project (see README). Known jobs:

| Job                            | Schedule        | Purpose                                          |
| ------------------------------ | --------------- | ------------------------------------------------ |
| `update-cluster-active-status` | `0 0 * * *`     | Daily refresh of `clusters.is_active`            |
| `rtp-cohort-snapshot-weekly`   | `0 0 * * 1`     | Weekly RTP cohort snapshot (Mon 00:00 UTC)       |
| `opp-cohort-snapshot-weekly`   | weekly          | Weekly OPP cohort snapshot                       |
| proof monitoring               | (see `0024`)    | Proof monitoring                                 |
| `gpu-price-request-weekly`     | `0 0 * * 1`     | Request GPU prices from Vast.ai (see below)       |
| `gpu-price-process-weekly`     | `2 0 * * 1`     | Process the Vast.ai response, insert price row    |
| downtime detection             | (see `0062`)    | Detect/record downtime incidents                 |

To inspect or debug, query `cron.job` / `cron.job_run_details` in Supabase, and check
Postgres logs (the snapshot functions emit `RAISE LOG`). See
[feature-rtp-cohort.md](./feature-rtp-cohort.md) for the cohort jobs and
[feature-gpu-price-index.md](./feature-gpu-price-index.md) for the GPU price jobs
(including the required Vast.ai key in Supabase Vault) in detail.

## One-off scripts (`scripts/`)

| Script                              | Purpose                                                    |
| ----------------------------------- | ---------------------------------------------------------- |
| `create-key.ts`                     | Create an API token (see caveat above).                    |
| `generate-openapi.ts`               | Build `public/openapi.json` from `lib/openapi`.            |
| `fix-api-docs-fouc.ts`              | Patch a FOUC issue in the generated API docs HTML.         |
| `backfill-daily-stats.ts`           | Populate `proofs_daily_stats`.                             |
| `backfill-proof-prices.ts`          | Backfill `gpu_price_index` links / proof costs.            |
| `cluster-performance.ts`            | Ad-hoc cluster performance analysis.                       |
| `concat-vk.ts`                      | Assemble airbender VKs (setup + layout). See verify doc.   |
| `create-historical-gpu-prices.ts` / `preview-historical-gpu-prices.ts` | Seed/preview historical GPU prices. |

Run with `npx tsx scripts/<name>.ts`. Most read env via `dotenv-flow` and need DB
credentials. The `scripts/input` and `scripts/output` folders hold their data files.

## Deploys

Hosted on **Netlify** (build badge in the root README). `netlify.toml` configures:

- A 301 redirect from `ethproofs.com` → `ethproofs.org`.
- **Edge rate limiting** (per IP, before functions run): `/api/v0/proofs` is permissive
  (10000), proof write endpoints (`proved`/`proving`/`queued`) are tight (60), downloads
  (100), and all other `/api/*` (30). This is in addition to the Upstash limiter in
  `lib/middleware/`.

ISR/cache revalidation is triggered through `app/api/revalidate` (used by Netlify and
manual cache busting). Cache tags are defined in `lib/constants.ts` (`TAGS`).

## Pre-PR checklist

```bash
pnpm lint
pnpm typecheck
pnpm build
```

Commits must follow Conventional Commits (commitlint runs on commit via husky). Branch
off `dev` and target `dev` in PRs. Full workflow is in `CONTRIBUTING.md`.

## Health & observability

- **Telegram alerts** — `lib/middleware/with-telemetry.ts` reports 5xx (and sampled
  4xx/2xx) plus slow/timeout warnings to the configured chat. If alerts stop, check
  `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID`.
- **Status page** — `/status` (backed by `lib/api/status.ts`).
- **Supabase logs** — first stop for cron failures and DB errors.
</content>

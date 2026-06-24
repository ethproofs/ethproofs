# Architecture

This is the lay of the land: where code lives, the data model, how requests are
authenticated, the shape of the public API, and the external services the app talks to.

## Directory map

| Path           | What's in it                                                                 |
| -------------- | ---------------------------------------------------------------------------- |
| `app/`         | Next.js App Router. Pages, route groups, and the REST API under `app/api/`.  |
| `components/`  | React components, grouped by feature (cohorts, rtp, provers, proof-buttons, charts, tables, header/sidebar, forms, error-boundaries, …). |
| `lib/`         | The brains. Server-side query/aggregation code (`lib/api/`), middleware, server services, OpenAPI spec, constants, types, and integration clients. |
| `db/`          | Drizzle schema (`schema.ts`), relations (`relations.ts`), and the client (`index.ts`). |
| `utils/`       | Supabase client factories (`utils/supabase/`) and small validation helpers.  |
| `supabase/`    | `config.toml`, SQL `migrations/`, `seed/`, storage `buckets/`, auth email `templates/`. |
| `scripts/`     | One-off / build-time scripts (OpenAPI generation, backfills, key creation).  |
| `styles/`      | Global CSS + Tailwind layers.                                                |
| `public/`      | Static assets, plus generated `openapi.json` and `api.html`.                 |

### Where to make a given change

| Task                       | Go to                                                              |
| -------------------------- | ----------------------------------------------------------------- |
| Add/modify a DB table      | `db/schema.ts` (+ `db/relations.ts`), then generate a migration   |
| Add a public API endpoint  | `app/api/v0/.../route.ts` + document it in `lib/openapi/`          |
| Add an internal API for UI  | `app/api/.../route.ts`                                            |
| Write a DB query/aggregation| `lib/api/*.ts`                                                    |
| Change auth / rate limiting | `lib/middleware/`                                                 |
| Add a page                  | `app/<route>/page.tsx`                                            |
| App-wide constants          | `lib/constants.ts`                                                |

## App Router structure (`app/`)

**Public pages:** `/` (the cohorts/landing page, in the `(cohorts)` route group),
`/blocks` + `/block/[…]`, `/clusters` + `/cluster/[…]`, `/teams` + `/team/[…]`,
`/provers` + `/prover/[…]`, `/zkvms`, `/guests`, `/metrics`, `/csp-benchmarks`,
`/status`, `/learn`, `/blog` (Ghost), `/docs`.

**Auth pages:** `/sign-in`, `/forgot-password`, `/reset-password`, `/auth/*`.

**Admin:** `/admin`.

**Route groups:** `(cohorts)` groups the RTP cohort landing page and the
`on-prem-proving-initiative` (OPP) page. See
[feature-rtp-cohort.md](./feature-rtp-cohort.md).

### Two API surfaces

`app/api/` contains two distinct kinds of routes — keep them straight:

- **`app/api/v0/*` — the public, versioned, documented API.** This is what proving
  teams integrate against. It's auth'd by API token and described by the OpenAPI spec.
  Endpoints cover blocks, clusters, proofs (list + status filters `proved`/`proving`/
  `queued` + binary downloads), CSP benchmarks (upload/download/list), and verification
  keys (active/download).
- **`app/api/*` (everything not under `v0`) — internal endpoints for the site's own
  UI.** These back the dashboards and charts: `metrics/*`, `provers/*`, `blocks/*`,
  `teams/*`, `stats/*`, `realtime/proofs`, `verify/proofs/[id]`,
  `verification-keys/*`, and `revalidate`. They are not part of the public contract and
  can change freely.

## Data model

Drizzle schema lives in `db/schema.ts`; relationships in `db/relations.ts`. The client
(`db/index.ts`) is configured with `casing: "snake_case"`. Row-Level Security (RLS) is
enabled on tables — public read, writes gated by API-token policies (see Auth below).

### Core entities

- **`blocks`** — Ethereum blocks (`block_number` PK, timestamp, gas, etc.). Proofs
  reference blocks.
- **`teams`** — proving teams. Tied to a Supabase auth user; own clusters, zkVMs, and
  API tokens; have `slug`, branding, `storage_quota_bytes`, approval flags.
- **`clusters`** — a team's hardware deployment. References a `prover_type` and a
  `guest_program`; has `num_gpus`, `is_active`, `is_approved`.
- **`cluster_versions`** — versioned configuration of a cluster. Holds the
  `zkvm_version_id`, an `index`, `is_active`, and **`vk_path`** (the verification key
  file path — central to the verify service). **Proofs reference a `cluster_version`,
  not just a cluster.**
- **`prover_types`** — hardware category (e.g. multi-GPU vs single-GPU,
  `gpu_configuration`, `processing_ratio`). RTP eligibility filters on this.
- **`zkvms`** / **`zkvm_versions`** — the proving system and its releases. `zkvms.slug`
  (e.g. `"airbender"`, `"zisk"`) is the key the verify service maps to a WASM verifier.
- **`guest_programs`** — the program being proven (language, maintainer, ecosystem).
- **`proofs`** — the central fact table. Each row = one block proven by one
  cluster_version. Key columns: `proof_status` (`queued`|`proving`|`proved`),
  `proving_time` (ms), `proving_cycles`, `size_bytes`, timestamps
  (`queued_/proving_/proved_timestamp`), and FKs to block, team, cluster,
  cluster_version, and `gpu_price_index`. Unique on `(block_number, cluster_version_id)`.
- **`api_auth_tokens`** — hashed API tokens with a `mode` (admin/read/write), tied to a
  team.

### Metrics, aggregates, and cohorts

- **`zkvm_performance_metrics`** / **`zkvm_security_metrics`** — per-zkVM benchmark and
  security data (proof size, verification time, security-target bits, soundcalc
  integration, bounty). RTP eligibility reads the security/performance ones.
- **`gpu_price_index`** — GPU hourly prices over time; used to compute proof cost.
- **`proofs_daily_stats`** / **`prover_daily_stats`** — pre-aggregated daily rollups for
  charts (populated by backfill scripts / cron).
- **`rtp_cohort_snapshots`** / **`opp_cohort_snapshots`** — weekly per-cluster cohort
  snapshots. See [feature-rtp-cohort.md](./feature-rtp-cohort.md).
- **`downtime_incidents`** — block ranges of L1 downtime, excluded from cohort scoring.
- **Views:** `recent_summary`, `teams_summary`, `cluster_summary` — convenience
  aggregates defined as Postgres views and mirrored in the schema.

> Note: `proofs.team_id` carries a `TODO:TEAM` to possibly drop it in favor of deriving
> the team via `cluster_version_id`. Be careful if you touch team attribution.

## Authentication

Two independent mechanisms:

1. **API tokens (the public API).** Proving teams authenticate with a bearer token
   (`Authorization` header; some RLS policies also read an `ethkey` request header).
   Tokens are stored **hashed** in `api_auth_tokens` with a `mode`
   (`admin`/`read`/`write`). The `lib/middleware/with-auth.ts` wrapper validates the
   incoming token and resolves the owning team. Write access to tables like `proofs` is
   additionally enforced at the DB layer by RLS policies that call an
   `is_allowed_apikey(...)` SQL function against the key's mode. Create tokens with
   `scripts/create-key.ts` (see [operations.md](./operations.md)).
2. **Supabase Auth (the website).** The dashboard/admin pages use Supabase Auth
   sessions via `@supabase/ssr`. Client factories are in `utils/supabase/`
   (`client.ts` for the browser/anon, `server.ts` for server/service-role). `middleware.ts`
   at the repo root wires session handling into Next.

Middleware wrappers in `lib/middleware/` compose around route handlers:
`with-auth.ts` (token validation), `with-rate-limit.ts` (Upstash, ~per-minute window,
fails open if Redis is unavailable), and `with-telemetry.ts` (timing + error reporting
to Telegram). There are combined helpers (auth + rate-limit) for public endpoints.

## Public API & OpenAPI docs

The public API is described with Zod schemas turned into an OpenAPI 3.1 document:

- Spec source: `lib/openapi/` (`index.ts` assembles the document; `blocks.ts`,
  `clusters.ts`, `proofs.ts`, `csp-benchmarks.ts` define paths).
- Generation: `pnpm api:docs` runs `scripts/generate-openapi.ts` →
  `public/openapi.json`, then Redocly builds `public/api.html`, then
  `scripts/fix-api-docs-fouc.ts` patches a flash-of-unstyled-content issue. This runs
  automatically in `postbuild`.
- When you add or change a `app/api/v0` endpoint, **update the matching `lib/openapi`
  definition** or the docs drift.

## External services

| Service        | Used for                          | Where                                            |
| -------------- | --------------------------------- | ------------------------------------------------ |
| Supabase       | Postgres, Auth, Storage, Realtime | `utils/supabase/`, `db/`, `supabase/`            |
| Upstash Redis  | API rate limiting                 | `lib/middleware/with-rate-limit.ts`              |
| Ghost          | Blog content                      | `lib/ghost.ts`, `/blog` routes                   |
| Nodemailer/SES | Transactional email               | `lib/server/email-service.ts`, `email-templates.ts` |
| Telegram       | Error/timeout alerts              | `lib/middleware/with-telemetry.ts`               |
| WASM verifiers | Proof verification                | `@ethproofs/*-wasm-stark-verifier` (see verify-service doc) |

Realtime proof updates use Supabase channels — see
`lib/hooks/realtime/` and `app/api/realtime/proofs`.

## Frontend data flow

Server components and `lib/api/*` functions read from Postgres (Drizzle) directly.
Client components fetch the internal `app/api/*` endpoints through TanStack React Query,
which handles caching and revalidation. Many server reads are wrapped with Next.js cache
tags (see `lib/constants.ts` `TAGS`) and can be busted via the `/api/revalidate`
endpoint.
</content>

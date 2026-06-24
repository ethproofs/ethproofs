# Feature: GPU Price Index (proof cost)

Every cost figure on the site — "avg cost per proof," the cohort cost column, the team
cost metrics, the GPU price chart — traces back to one small table, `gpu_price_index`,
fed weekly from the **Vast.ai** GPU marketplace. This is a deceptively involved
subsystem: the price is fetched **entirely inside Postgres** via `pg_net`, with the API
key in **Supabase Vault**, using a two-phase async cron. It's worth understanding before
you touch anything that displays a dollar amount.

## What it does

Once a week the database asks Vast.ai for current on-demand rental offers of a reference
GPU (**RTX 5090**), takes the **median** `dph_total` (dollars-per-hour) across the
offers, and inserts one row into `gpu_price_index`. That row is the canonical "what a GPU
costs right now" datapoint.

Proof cost is then derived from that hourly price plus how long/how many GPUs a proof
used. There is no external pricing service in the Node app — the app only *reads* the
table.

## Data model

`gpu_price_index` (`db/schema.ts`):

| Column         | Meaning                                              |
| -------------- | --------------------------------------------------- |
| `id`           | PK                                                  |
| `gpu_name`     | reference GPU (currently `"RTX 5090"`)              |
| `hourly_price` | `numeric(10,6)` — median $/hour from Vast.ai        |
| `created_at`   | insert time (the de-facto "as of" date)            |

Unique on `(gpu_name, created_at)`. The table is **append-only** — each weekly run adds a
row; history is the series of rows over time.

## How a proof gets priced

Two links connect this table to proof cost:

1. **Snapshot at prove time.** When a proof is marked `proved` via
   `app/api/v0/proofs/proved/route.ts`, the handler calls `getLatestGpuPriceIndex()`
   (`lib/api/gpu-price-index.ts` — most recent row by `created_at`) and stores its `id`
   on the proof's `gpu_price_index_id`. So each proof is pinned to the price that was
   current when it was proved; later price changes don't rewrite history.
2. **Cost computation.** Cost combines that hourly price with the cluster's `num_gpus`
   and the proof's `proving_time`. The RTP/OPP snapshot functions compute
   `avg_cost_per_proof` as roughly:

   ```
   Σ( num_gpus · hourly_price · proving_time_ms / 3_600_000 ) / proven_blocks
   ```

   The same join (`proofs.gpu_price_index_id → gpu_price_index.id`) shows up across
   `lib/api/metrics.ts`, `teams-metrics.ts`, and the daily-stats rollups. If a proof has
   a NULL `gpu_price_index_id` (no price existed yet, or a backfill gap), its cost is
   NULL and it drops out of cost averages and the prover scatter plot.

## The weekly fetch (how the price actually lands)

This is the non-obvious part. It runs as Postgres functions on a `pg_cron` schedule,
using `pg_net` for outbound HTTP. The current design (migration `0055`) is a **two-phase
async** job; the original (migration `0039`) was a single synchronous function that
polled inline — read both to understand why it changed.

### Required setup (per environment)

- Extensions: `pg_net` and `pg_cron` (the migration enables them).
- **Vast.ai API key in Supabase Vault**, secret name `vastai_api_key`:
  ```sql
  INSERT INTO vault.secrets (name, secret) VALUES ('vastai_api_key', 'YOUR_KEY');
  ```
  (Or Project Settings → Vault in the dashboard.)
- **Local dev fallback:** `pg_net` background delivery can lag locally, and Vault may be
  absent. The function `get_vastai_api_key()` falls back to an `app_config(key, value)`
  table if Vault has no key:
  ```sql
  CREATE TABLE app_config (key TEXT PRIMARY KEY, value TEXT);
  INSERT INTO app_config VALUES ('vastai_api_key', 'YOUR_KEY');
  ```

### Current jobs (migration 0055)

Because `pg_net` delivers responses asynchronously, the work is split into a request job
and a process job two minutes later:

| Job                         | Schedule      | Function                       | Does                                                        |
| --------------------------- | ------------- | ------------------------------ | ----------------------------------------------------------- |
| `gpu-price-request-weekly`  | `0 0 * * 1`   | `request_gpu_price_update()`   | POSTs to Vast.ai, stores the `pg_net` request id in `gpu_price_pending_requests`. |
| `gpu-price-process-weekly`  | `2 0 * * 1`   | `process_gpu_price_response()` | Reads the response from `net._http_response`, computes the median, inserts the row, clears the pending request. |

Helper tables/functions: `gpu_price_pending_requests` (tracks in-flight request ids),
`get_vastai_api_key()` (Vault + `app_config` fallback). All functions are
`SECURITY DEFINER`, wrap work in an exception handler, and log via `RAISE LOG`.

> **Migration note — don't get confused by the old function.** Migration `0039` created a
> single `update_gpu_price_index()` that fired the request *and* polled for the response
> in one transaction (up to 60s of `pg_sleep`). Migration `0055` **drops that function**,
> unschedules its `update-gpu-price-index-weekly` job, and replaces it with the
> request/process pair above. If you see `update_gpu_price_index` referenced anywhere, it
> is dead code from `0039`.

### The Vast.ai query

The POST hits `https://console.vast.ai/api/v0/bundles/` with `Authorization: <key>`,
asking for up to 100 `on-demand`, `verified` offers for `gpu_name = "RTX 5090"`. Median
is `percentile_cont(0.5)` over each offer's `dph_total`. If the response is non-200,
missing `offers`, or empty, the function logs and inserts nothing (no row that week).

## Reading it in the app

- **`lib/api/gpu-price-index.ts` → `getLatestGpuPriceIndex()`** — latest row; used at
  prove time to snapshot the price onto a proof.
- **`lib/api/metrics.ts` → `fetchGpuPriceHistory(weeks)`** — weekly-bucketed series of
  avg GPU price joined with avg proof cost (from `proofs_daily_stats`), cached. Backs the
  GPU price chart.
- **API route:** `app/api/metrics/gpu-price/route.ts` — `GET ?weeks=N` (default 32,
  clamped 1–52) → `fetchGpuPriceHistory`.
- Cost values (`avg_cost_per_proof`) flow through `rtp.ts`, `opp.ts`,
  `provers-metrics.ts`, `provers-table.ts`, `teams-metrics.ts`, and `cohort.utils.ts`.

## Scripts (`scripts/`)

| Script                              | Purpose                                                                 |
| ----------------------------------- | ----------------------------------------------------------------------- |
| `backfill-proof-prices.ts`          | Assign `gpu_price_index_id` to historical proofs that predate pricing (matches each proof to the price row in effect at the time). Run after seeding history. |
| `create-historical-gpu-prices.ts`   | Insert backdated `gpu_price_index` rows (bootstrap history before the cron existed). |
| `preview-historical-gpu-prices.ts`  | Dry-run preview of the historical prices before inserting.              |
| `cluster-performance.ts`            | Ad-hoc cluster cost/performance analysis on top of the priced proofs.   |

Run with `npx tsx scripts/<name>.ts` (they read DB creds via `dotenv-flow`). Typical
bootstrap order for a fresh environment: preview → create historical → backfill proof
prices.

## Gotchas & maintenance

- **One reference GPU.** The whole index is RTX 5090 only — `gpu_model` is hardcoded in
  the SQL functions. Changing the reference GPU means a new migration, and it shifts
  every cost number. It does **not** reflect each cluster's actual hardware; it's a
  single market proxy.
- **Vault key is a hard dependency.** No `vastai_api_key` → the function logs "key not
  found" and inserts nothing. A silent week of missing prices means NULL costs on proofs
  proved that week. Check Postgres logs if costs go blank.
- **Two-phase timing.** The process job runs 2 minutes after the request job, assuming
  `pg_net` has delivered by then. If Vast.ai is slow, the pending request carries over —
  `process_gpu_price_response()` loops over all pending rows, so a late response is picked
  up on a subsequent run rather than lost.
- **Append-only, no dedup beyond the unique constraint.** Manual re-runs can add extra
  rows (unique on `(gpu_name, created_at)` only).
- **Backfill drives historical cost.** Old proofs show no cost until
  `backfill-proof-prices.ts` links them; gaps in `gpu_price_index` history leave gaps in
  cost.
- **Cost feeds the cohorts.** Because `avg_cost_per_proof` lands in the RTP/OPP snapshots,
  a pricing outage also shows up as missing cost in the cohort tables — see
  [feature-rtp-cohort.md](./feature-rtp-cohort.md).
</content>

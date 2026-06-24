# Feature: RTP Cohort (Real-Time Proving)

The RTP cohort is the scoreboard for the "race to mainnet-grade L1 zkEVMs." It tracks
which proving clusters are **fast and reliable enough** to prove Ethereum blocks in real
time, summarizing each eligible cluster's last 7 days into a weekly snapshot.

There's a sibling program, **OPP** (On-Prem Proving Initiative, the "1:10" initiative),
with the same machinery but a looser performance bar. Anything below that applies to
both unless noted; OPP differs only in thresholds and column names.

## The concept

Each multi-GPU cluster is scored every week on two axes:

- **Performance score** — the % of blocks proven *fast* (under the time threshold).
  RTP threshold: **10 seconds**. A cluster needs **≥ 70%** to be eligible.
- **Liveness score** — the % of blocks the cluster proved *at all* (vs. missed/stuck).
  RTP needs **≥ 95%**.

The asymmetry is intentional: a cluster can be fast but still ineligible if it misses
blocks. Reliability is the harder bar.

Two more rates are tracked but don't gate eligibility on their own:

- **Stunner rate** — % proven but *over* the time threshold (slow proofs).
- **Paralyzer rate** — % of blocks stuck in `queued`/`proving` beyond the paralyzer
  cutoff (20 min). These are "paralyzed" blocks.

### Tunable constants

From `lib/constants.ts` (these are the source of truth for the **app/UI**; note the
caveat below about the cron):

```
RTP_WINDOW_DAYS                  = 7
RTP_PARALYZER_CUTOFF_MINUTES     = 20
RTP_PERFORMANCE_SCORE_THRESHOLD  = 70
RTP_LIVENESS_SCORE_THRESHOLD     = 95
RTP_PERFORMANCE_TIME_THRESHOLD_MS = 10_000   // 10s

OPP_PARALYZER_CUTOFF_MINUTES     = 20
OPP_PERFORMANCE_SCORE_THRESHOLD  = 80
OPP_PERFORMANCE_TIME_THRESHOLD_MS = 120_000  // 2 min
```

> **Gotcha:** the weekly snapshot is computed by a Postgres function defined in a
> migration, which has **its own hardcoded thresholds**. The `lib/constants.ts` values
> drive the frontend and any TS-side logic, but changing a *scoring* threshold for real
> means editing the SQL function and shipping a new migration too. Keep the two in sync.

## Data model

The snapshot tables (`db/schema.ts`):

`rtp_cohort_snapshots` — one row per `(cluster_id, snapshot_week)` (unique):

| Column                              | Meaning                                            |
| ----------------------------------- | -------------------------------------------------- |
| `cluster_id`                        | FK → clusters                                       |
| `snapshot_week`                     | week bucket (Monday 00:00 UTC)                      |
| `total_blocks`                      | blocks in the evaluation window                     |
| `blocks_proven`                     | of those, how many got proved                       |
| `sub_10s_proofs` / `over_10s_proofs`| proved under / over the 10s threshold               |
| `paralyzed_blocks`                  | stuck blocks (past paralyzer cutoff)                |
| `performance_score`                 | `sub_10s / total * 100`                             |
| `liveness_score`                    | `blocks_proven / total * 100`                       |
| `stunner_rate` / `paralyzer_rate`   | over-threshold % / paralyzed %                      |
| `is_eligible`                       | did it pass all rules this week                     |
| `avg_cost_per_proof`                | from `gpu_price_index`; nullable                    |
| `created_at`                        | insert time                                         |

`opp_cohort_snapshots` is identical except the bucket columns are
`sub_threshold_proofs` / `over_threshold_proofs` (the threshold is 2 min, not 10s).

## How a snapshot is produced (the weekly cron)

A Postgres `pg_cron` job runs the snapshot function once a week:

- Job name: **`rtp-cohort-snapshot-weekly`**, schedule **`0 0 * * 1`** (Monday 00:00
  UTC). OPP has its own `opp-cohort-snapshot-weekly`.
- It calls the SQL function `snapshot_rtp_cohort()` (defined/updated across the
  migrations listed below). For each **multi-GPU** cluster it:
  1. Selects proofs over a trailing 7-day window, **excluding downtime blocks**
     (`is_downtime_block(...)`, sourced from `downtime_incidents`).
  2. Counts sub-threshold proofs, proven blocks, and paralyzed blocks.
  3. Computes the four scores/rates and `avg_cost_per_proof`
     (`Σ(num_gpus · hourly_price · proving_time_ms / 3_600_000) / proven_blocks`).
  4. Evaluates **eligibility** (all must hold):
     - zkVM has soundcalc integration,
     - zkVM meets the **M2 security bar** — security-target bits and proof-size limits
       (added in migration `0069`),
     - performance score ≥ 70%, liveness score ≥ 95%.
  5. Upserts the row (`ON CONFLICT (cluster_id, snapshot_week)`).

The function uses `RAISE LOG` and wraps work in an exception handler, so failures show
up in Supabase Postgres logs rather than silently disappearing.

### Migration history (read these to understand current behavior)

| Migration | What it did                                                       |
| --------- | ----------------------------------------------------------------- |
| `0052_add-rtp-cohort-snapshots`        | created the table                       |
| `0053_add-rtp-cohort-snapshot-cron`    | created the function + weekly cron      |
| `0056_update-rtp-score-thresholds`     | moved thresholds to 70% / 95%           |
| `0060_exclude-downtime-from-rtp-snapshot` | excluded downtime blocks             |
| `0062_add-downtime-detection-cron`     | downtime detection job                  |
| `0065_add-opp-cohort-snapshots`        | OPP table                               |
| `0066_add-opp-cohort-snapshot-cron`    | OPP function + cron                      |
| `0069_update-rtp-cohort-m2-eligibility`| added M2 security/size eligibility gates|

## Server-side reads

Query functions live in `lib/api/rtp.ts` (and `lib/api/opp.ts` for OPP):

- Eligible / ineligible cluster scores for the latest week (sorted by performance then
  liveness).
- **Composition** — ~26 weeks of membership history, built into a per-cluster timeline
  (used for the heatmap).
- **Performance** breakdown — aggregate block buckets (sub-threshold / stunned /
  paralyzed / offline) across eligible clusters.
- **Proof-time distribution** — histogram buckets of proving time.

Plus `lib/api/provers-metrics.ts` → `fetchRtpCohortConsistency()` for the long
(~52-week) prover-inclusion timeline, and `lib/api/cohort.utils.ts` for the row/member
type conversions. Cache tags `TAGS.RTP_COHORT` / `TAGS.OPP_COHORT` (in
`lib/constants.ts`) gate revalidation; reads are cached ~1 hour.

Consistency/composition queries use `generate_series()` to emit a row for **every**
week, with a `hasData` flag — so "no proof activity that week" is distinguishable from
"evaluated but ineligible." Don't treat a missing `hasData` as ineligible.

## UI

The landing page is `app/(cohorts)/page.tsx`; OPP is
`app/(cohorts)/on-prem-proving-initiative/page.tsx`. Internal consistency data is served
by `app/api/provers/consistency/route.ts`.

Key components:

- `components/cohorts/rtp-cohort-tabs.tsx` — two tabs: **RTP cohort** (eligible) and
  **evaluated, not eligible**.
- `components/cohorts/cohort-table/` — the sortable table (`cohort-table.tsx`,
  `columns.tsx`): team, zkVM, guest program, cluster config, performance, liveness,
  stunner rate, paralyzer rate, blocks proven, avg cost/proof.
- `components/cohorts/cohort-composition.tsx` — 26-week membership heatmap.
- `components/cohorts/cohort-performance.tsx` — pie of block outcomes.
- `components/cohorts/proof-time-distribution.tsx` — proof-time histogram.
- `components/rtp/rtp-details-section.tsx`, `rtp-cohort-rules.tsx`,
  `rtp-cohort-scores.tsx` — the rules/scores explainer accordion.
- `components/provers/rtp-cohort-consistency.tsx` — long inclusion timeline on the
  provers page.

## Maintenance checklist & gotchas

- **Watch the Monday cron.** Check Supabase Postgres logs after `0 0 * * 1` UTC. A bad
  week of data (or a missing dependency) shows up here.
- **Thresholds live in two places.** UI constants in `lib/constants.ts`; scoring logic
  in the SQL function. Changing real behavior = a new migration.
- **Eligibility depends on populated metrics.** If a zkVM's `zkvm_security_metrics` /
  `zkvm_performance_metrics` rows are missing/NULL, its clusters fall out of the cohort
  (the M2 gates fail). When a new zkVM joins, make sure those rows exist.
- **GPU prices feed cost.** `avg_cost_per_proof` is NULL without `gpu_price_index` data,
  and provers without price data are filtered out of the scatter plot. See
  [feature-gpu-price-index.md](./feature-gpu-price-index.md).
- **Downtime exclusion relies on `is_downtime_block()` / `downtime_incidents`.** Keep
  incidents current during L1 maintenance, or provers get unfairly penalized.
- **Manual re-runs overwrite the current week.** Triggering the function mid-week upserts
  the current Monday's row.
- **Only multi-GPU clusters are scored** (`prover_types.gpu_configuration`). Single-GPU
  clusters never get snapshots — by design.
- **No retention/cleanup job.** Snapshots accumulate; the UI just queries the last
  N weeks.
</content>

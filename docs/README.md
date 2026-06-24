# Ethproofs — Developer Handoff Guide

This folder is the onboarding guide for whoever takes over Ethproofs. It is written
to get a new engineer productive quickly: what the project is, how it's built, and
how to run, change, and operate it. Two features get their own deep-dive because they
carry the most domain logic and the most foot-guns: the **RTP cohort** and the
**verify service**.

Read these in order:

1. **[architecture.md](./architecture.md)** — the stack, the directory map, the data
   model, how auth and the public API work, and the external services the app depends
   on. Start here.
2. **[feature-rtp-cohort.md](./feature-rtp-cohort.md)** — the Real-Time Proving cohort
   (and its OPP sibling): what it measures, the weekly snapshot cron, eligibility
   rules, and the UI.
3. **[feature-verify-service.md](./feature-verify-service.md)** — proof verification
   via WASM stark verifiers: how a proof is checked in the browser and on the server,
   how verifiers are mapped and upgraded, and the verification-key flow.
4. **[feature-gpu-price-index.md](./feature-gpu-price-index.md)** — where every cost
   figure comes from: the weekly Vast.ai → Postgres pricing job and how proofs get
   priced.
5. **[operations.md](./operations.md)** — the runbook: local setup, migrations,
   seeding, type generation, API keys, deploys, cron jobs, and the one-off scripts.

## What Ethproofs is

Ethproofs (ethproofs.org) is a public dashboard and API for **Ethereum zk-proof
production**. Proving teams run **clusters** (GPU hardware deployments) that generate
**proofs** of Ethereum **blocks** using a **zkVM** (zisk, pico, openvm, airbender, …).
Ethproofs collects those proofs over a public API, stores them, and surfaces metrics:
how fast each cluster proves, how much it costs, how reliable it is, and whether a
proof actually verifies.

The site frames much of this as a race toward **mainnet-grade real-time proving** —
the ability to prove an L1 block in under ~10 seconds, reliably. The RTP cohort is the
scoreboard for that race.

## The 5-minute mental model

- **Teams** own **clusters**. A cluster has versioned configurations
  (**cluster_versions**), each tied to a **zkvm_version**.
- Teams push **proofs** into Ethproofs via the public **`/api/v0`** REST API, keyed by
  an **API token**. Each proof references a **block**, a **cluster**, and a
  **cluster_version**, and moves through statuses `queued → proving → proved`.
- The app computes metrics on top of that proof stream — per cluster, per team, per
  zkVM — and renders dashboards.
- Two heavier subsystems sit on top:
  - **RTP cohort**: a weekly Postgres cron summarizes each multi-GPU cluster's last 7
    days into a snapshot and decides if it's "eligible" (fast + reliable enough).
  - **Verify service**: anyone can verify a `proved` proof against its zkVM's WASM
    verifier and the cluster's verification key — in the browser or server-side.

## Tech stack at a glance

| Concern            | Choice                                                        |
| ------------------ | ------------------------------------------------------------- |
| Framework          | Next.js 15 (App Router, React 19, Turbopack)                  |
| Language           | TypeScript                                                    |
| DB                 | Postgres via Supabase                                         |
| ORM / migrations   | Drizzle ORM + Drizzle Kit                                     |
| Data fetching (UI) | TanStack React Query                                          |
| Auth               | API tokens (hashed) for the API; Supabase Auth for the site   |
| Rate limiting      | Upstash Redis                                                 |
| Storage            | Supabase Storage (proof binaries, verification keys, benchmarks) |
| Verification       | `@ethproofs/*-wasm-stark-verifier` WASM packages              |
| Blog/CMS           | Ghost Content API                                             |
| Email              | Nodemailer over SMTP (AWS SES)                                |
| Alerting           | Telegram bot                                                  |
| Hosting            | Netlify                                                       |
| Package manager    | pnpm                                                          |

## Getting running (short version)

```bash
pnpm install
supabase start        # local Postgres + Studio (needs Docker)
# create .env.local with the URL/anon key supabase prints, plus DATABASE_URL
pnpm dev
```

Full setup, seeding, and env-var details are in [operations.md](./operations.md).

## Conventions you must follow

The repo has firm code conventions in the root **`CLAUDE.md`** — read it. Highlights:
no enums, no comments unless asked, `function` declarations for top-level
functions/components, arrow functions for callbacks, interfaces for object shapes,
Remeda for non-trivial data transforms, kebab-case filenames with a descriptive
`*.layout.tsx` / `*.utils.ts` suffix, no `as` casts or non-null `!`, and never throw
in normal control flow (return `null`/typed status instead). Commits use Conventional
Commits (enforced by commitlint via husky). Contribution workflow lives in the root
**`CONTRIBUTING.md`**.
</content>
</invoke>

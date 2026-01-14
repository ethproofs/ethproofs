import { sql } from "drizzle-orm"
import {
  bigint,
  boolean,
  check,
  customType,
  decimal,
  doublePrecision,
  index,
  integer,
  numeric,
  pgEnum,
  pgPolicy,
  pgTable,
  pgView,
  real,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"
import { authUsers } from "drizzle-orm/supabase"

export const keyMode = pgEnum("key_mode", ["admin", "read", "write"])

export const apiAuthTokens = pgTable(
  "api_auth_tokens",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    mode: keyMode().default("read").notNull(),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    token: text().notNull().unique(),
    team_id: uuid()
      .notNull()
      .references(() => teams.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  () => [
    pgPolicy("Allow users to see API token entries they own", {
      as: "permissive",
      for: "select",
      to: ["anon"],
      using: sql`is_allowed_apikey(((current_setting('request.headers'::text, true))::json ->> 'ethkey'::text), '{admin,read,write}'::key_mode[])`,
    }),
  ]
).enableRLS()

export const blocks = pgTable(
  "blocks",
  {
    block_number: bigint("block_number", { mode: "number" })
      .primaryKey()
      .notNull(),
    timestamp: timestamp({ withTimezone: true, mode: "string" }),
    gas_used: bigint("gas_used", { mode: "number" }),
    transaction_count: smallint("transaction_count"),
    hash: text(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  },
  () => [
    pgPolicy("Enable read access for all users", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`true`,
    }),
    pgPolicy("Enable insert for users with an api key", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
  ]
).enableRLS()

export const proverTypes = pgTable("prover_types", {
  id: smallint().primaryKey().notNull(),
  name: text().notNull().unique(),
  processing_ratio: text("processing_ratio").notNull(),
  gpu_configuration: text("gpu_configuration").notNull(),
  deployment_type: text("deployment_type").notNull(),
  created_at: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  })
    .defaultNow()
    .notNull(),
})

export const clusters = pgTable(
  "clusters",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    index: smallint(),
    name: text().notNull(),
    team_id: uuid()
      .notNull()
      .references(() => teams.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    prover_type_id: smallint("prover_type_id")
      .notNull()
      .references(() => proverTypes.id),
    hardware_description: text(),
    is_open_source: boolean().notNull().default(false),
    num_gpus: integer("num_gpus").notNull().default(1),
    is_active: boolean().notNull().default(false),
    software_link: text(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  },
  () => [
    pgPolicy("Enable read access for all users", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`true`,
    }),
    pgPolicy("Enable insert for users with an api key", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
  ]
).enableRLS()

export const clusterVersions = pgTable(
  "cluster_versions",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    cluster_id: uuid("cluster_id")
      .notNull()
      .references(() => clusters.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    index: smallint().notNull(),
    zkvm_version_id: bigint({ mode: "number" })
      .notNull()
      .references(() => zkvmVersions.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    vk_path: text(),
    is_active: boolean().notNull().default(false),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("cluster_versions_cluster_id_index_uk").on(
      table.cluster_id,
      table.index
    ),
    index("cluster_versions_cluster_id_idx").on(table.cluster_id),
    index("cluster_versions_cluster_id_is_active_idx").on(
      table.cluster_id,
      table.is_active
    ),
  ]
)

export const teams = pgTable(
  "teams",
  {
    id: uuid("id")
      .primaryKey()
      .references(() => authUsers.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    github_org: text("github_org"),
    logo_url: text("logo_url"),
    twitter_handle: text("twitter_handle"),
    website_url: text("website_url"),
    storage_quota_bytes: bigint("storage_quota_bytes", { mode: "number" }),
    approved: boolean("approved").notNull().default(false),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  },
  () => [
    pgPolicy("Enable read access for all users", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`true`,
    }),
  ]
).enableRLS()

export const zkvms = pgTable("zkvms", {
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  team_id: uuid()
    .notNull()
    .references(() => teams.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  name: text().notNull(),
  slug: text("slug").notNull().unique(),
  isa: text().notNull(),
  repo_url: text().notNull(),
  continuations: boolean().notNull().default(false),
  dual_licenses: boolean().notNull().default(false),
  is_open_source: boolean().notNull().default(false),
  is_proving_mainnet: boolean().notNull().default(false),
  parallelizable_proving: boolean().notNull().default(false),
  precompiles: boolean().notNull().default(false),
  frontend: text().notNull(),
  created_at: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  })
    .defaultNow()
    .notNull(),
})

export const zkvmVersions = pgTable("zkvm_versions", {
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  zkvm_id: bigint({ mode: "number" })
    .notNull()
    .references(() => zkvms.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  version: text().notNull(),
  created_at: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  })
    .defaultNow()
    .notNull(),
})

export const proofs = pgTable(
  "proofs",
  {
    proof_id: integer("proof_id").primaryKey().generatedByDefaultAsIdentity(),
    block_number: bigint("block_number", { mode: "number" })
      .notNull()
      .references(() => blocks.block_number),
    proof_status: text("proof_status").notNull(),
    proving_cycles: bigint("proving_cycles", { mode: "number" }),
    // TODO:TEAM - drop this ref, has it been replaced by cluster_version_id?
    team_id: uuid()
      .notNull()
      .references(() => teams.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
    proved_timestamp: timestamp("proved_timestamp", {
      withTimezone: true,
      mode: "string",
    }),
    proving_timestamp: timestamp("proving_timestamp", {
      withTimezone: true,
      mode: "string",
    }),
    queued_timestamp: timestamp("queued_timestamp", {
      withTimezone: true,
      mode: "string",
    }),
    cluster_version_id: bigint("cluster_version_id", { mode: "number" })
      .notNull()
      .references(() => clusterVersions.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    cluster_id: uuid("cluster_id")
      .notNull()
      .references(() => clusters.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    proving_time: integer("proving_time"),
    size_bytes: bigint("size_bytes", { mode: "number" }),
    gpu_price_index_id: bigint("gpu_price_index_id", {
      mode: "number",
    }).references(() => gpuPriceIndex.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
  },
  (table) => [
    unique("unique_block_cluster_version").on(
      table.block_number,
      table.cluster_version_id
    ),
    index("proofs_cluster_version_id_idx").on(table.cluster_version_id),
    index("proofs_cluster_id_idx").on(table.cluster_id),
    index("proofs_proved_timestamp_idx").on(table.proved_timestamp),
    index("proofs_created_at_idx").on(table.created_at),
    index("proofs_updated_at_idx").on(table.updated_at),
    pgPolicy("Enable updates for users with an api key", {
      as: "permissive",
      for: "update",
      to: ["public"],
      using: sql`is_allowed_apikey(((current_setting('request.headers'::text, true))::json ->> 'ethkey'::text), '{admin,write}'::key_mode[])`,
    }),
    pgPolicy("Enable read access for all users", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
    pgPolicy("Enable insert for users with an api key", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
    check(
      "proofs_proof_status_check",
      sql`proof_status = ANY (ARRAY['queued'::text, 'proving'::text, 'proved'::text])`
    ),
  ]
).enableRLS()

// Severity level enum for performance and security metrics
export const severityLevel = pgEnum("severity_level", [
  "red",
  "yellow",
  "green",
])

export const zkvmPerformanceMetrics = pgTable(
  "zkvm_performance_metrics",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedByDefaultAsIdentity(),
    zkvm_id: bigint("zkvm_id", { mode: "number" })
      .notNull()
      .references(() => zkvms.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .unique(),
    size_bytes: bigint("size_bytes", { mode: "number" }).notNull(),
    verification_ms: integer("verification_ms").notNull(),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  () => [
    pgPolicy("Enable read access for all users", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`true`,
    }),
  ]
).enableRLS()

export const zkvmSecurityMetrics = pgTable(
  "zkvm_security_metrics",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedByDefaultAsIdentity(),
    zkvm_id: bigint("zkvm_id", { mode: "number" })
      .notNull()
      .references(() => zkvms.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .unique(),
    implementation_soundness: severityLevel(
      "implementation_soundness"
    ).notNull(),
    evm_stf_bytecode: severityLevel("evm_stf_bytecode").notNull(),
    quantum_security: severityLevel("quantum_security").notNull(),
    security_target_bits: integer("security_target_bits").notNull(),
    max_bounty_amount: bigint("max_bounty_amount", {
      mode: "number",
    }).notNull(),
    soundcalc_integration: boolean("soundcalc_integration")
      .notNull()
      .default(false),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  () => [
    pgPolicy("Enable read access for all users", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`true`,
    }),
  ]
).enableRLS()

export const recentSummary = pgView("recent_summary", {
  total_proven_blocks: bigint("total_proven_blocks", { mode: "number" }),
  avg_cost_per_proof: doublePrecision("avg_cost_per_proof"),
  median_cost_per_proof: doublePrecision("median_cost_per_proof"),
  avg_proving_time: numeric("avg_proving_time"),
  median_proving_time: numeric("median_proving_time"),
})
  .with({ securityInvoker: true })
  .as(
    sql`
    SELECT count(DISTINCT b.block_number) AS total_proven_blocks,
      -- Calculate average cost per proof using gpu_price_index snapshot
      COALESCE(avg(c.num_gpus::double precision * gpi.hourly_price * p.proving_time::double precision / (1000.0 * 60::numeric * 60::numeric)::double precision), 0::numeric::double precision) AS avg_cost_per_proof,
      -- Calculate median cost per proof
      COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY c.num_gpus::double precision * gpi.hourly_price * p.proving_time::double precision / (1000.0 * 60::numeric * 60::numeric)::double precision), 0::numeric::double precision) AS median_cost_per_proof,
      -- Calculate average latency
      COALESCE(avg(p.proving_time), 0::numeric) AS avg_proving_time,
      -- Calculate median latency
      COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.proving_time), 0::numeric) AS median_proving_time
    FROM blocks b
    INNER JOIN proofs p ON b.block_number = p.block_number AND p.proof_status = 'proved'::text
    INNER JOIN cluster_versions cv ON p.cluster_version_id = cv.id
    INNER JOIN clusters c ON cv.cluster_id = c.id
    LEFT JOIN gpu_price_index gpi ON p.gpu_price_index_id = gpi.id
    WHERE b."timestamp" >= (now() - '30 days'::interval)`
  )

export const teamsSummary = pgView("teams_summary", {
  team_id: uuid("team_id"),
  team_name: text("team_name"),
  logo_url: text("logo_url"),
  avg_cost_per_proof: doublePrecision("avg_cost_per_proof"),
  avg_proving_time: numeric("avg_proving_time"),
  total_proofs: bigint("total_proofs", { mode: "number" }),
  avg_cost_per_proof_multi: doublePrecision("avg_cost_per_proof_multi"),
  avg_proving_time_multi: numeric("avg_proving_time_multi"),
  total_proofs_multi: bigint("total_proofs_multi", { mode: "number" }),
  avg_cost_per_proof_single: doublePrecision("avg_cost_per_proof_single"),
  avg_proving_time_single: numeric("avg_proving_time_single"),
  total_proofs_single: bigint("total_proofs_single", { mode: "number" }),
})
  .with({ securityInvoker: true })
  .as(
    sql`
    SELECT t.id as team_id,
      t.name as team_name,
      t.logo_url,
      -- All proofs
      COALESCE(sum(c.num_gpus::double precision * gpi.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) / NULLIF(count(p.proof_id), 0)::double precision, 0::double precision) AS avg_cost_per_proof,
      COALESCE(avg(p.proving_time), 0::numeric) AS avg_proving_time,
      count(p.proof_id) AS total_proofs,
      -- Multi-GPU proofs (using prover_types.gpu_configuration)
      COALESCE(sum(CASE WHEN pt.gpu_configuration = 'multi-gpu' THEN (c.num_gpus::double precision * gpi.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) ELSE 0 END) / NULLIF(sum(CASE WHEN pt.gpu_configuration = 'multi-gpu' THEN 1 ELSE 0 END), 0)::double precision, 0::double precision) AS avg_cost_per_proof_multi,
      COALESCE(avg(CASE WHEN pt.gpu_configuration = 'multi-gpu' THEN p.proving_time ELSE NULL END), 0::numeric) AS avg_proving_time_multi,
      sum(CASE WHEN pt.gpu_configuration = 'multi-gpu' THEN 1 ELSE 0 END) AS total_proofs_multi,
      -- Single-GPU proofs (using prover_types.gpu_configuration)
      COALESCE(sum(CASE WHEN pt.gpu_configuration = 'single-gpu' THEN (c.num_gpus::double precision * gpi.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) ELSE 0 END) / NULLIF(sum(CASE WHEN pt.gpu_configuration = 'single-gpu' THEN 1 ELSE 0 END), 0)::double precision, 0::double precision) AS avg_cost_per_proof_single,
      COALESCE(avg(CASE WHEN pt.gpu_configuration = 'single-gpu' THEN p.proving_time ELSE NULL END), 0::numeric) AS avg_proving_time_single,
      sum(CASE WHEN pt.gpu_configuration = 'single-gpu' THEN 1 ELSE 0 END) AS total_proofs_single
    FROM teams t
    LEFT JOIN proofs p ON t.id = p.team_id AND p.proof_status = 'proved'::text
    LEFT JOIN cluster_versions cv ON p.cluster_version_id = cv.id
    LEFT JOIN clusters c ON cv.cluster_id = c.id
    LEFT JOIN prover_types pt ON c.prover_type_id = pt.id
    LEFT JOIN gpu_price_index gpi ON p.gpu_price_index_id = gpi.id
    GROUP BY t.id`
  )

export const clusterSummary = pgView("cluster_summary", {
  cluster_id: uuid("cluster_id"),
  cluster_name: text("cluster_name"),
  team_id: uuid("team_id"),
  avg_cost_per_proof: doublePrecision("avg_cost_per_proof"),
  avg_proving_time: numeric("avg_proving_time"),
})
  .with({ securityInvoker: true })
  .as(
    sql`
    SELECT c.id as cluster_id,
      c.name as cluster_name,
      c.team_id,
      COALESCE(sum(c.num_gpus::double precision * gpi.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) / NULLIF(count(p.proof_id), 0)::double precision, 0::double precision) AS avg_cost_per_proof,
      avg(p.proving_time) AS avg_proving_time
    FROM clusters c
    LEFT JOIN cluster_versions cv ON c.id = cv.cluster_id
    LEFT JOIN proofs p ON cv.id = p.cluster_version_id AND p.proof_status = 'proved'::text
    LEFT JOIN gpu_price_index gpi ON p.gpu_price_index_id = gpi.id
    GROUP BY c.id`
  )

// Tables for aggregated data and charts

// Daily aggregated metrics for proofs
export const proofsDailyStats = pgTable(
  "proofs_daily_stats",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    date: timestamp("date", { withTimezone: true, mode: "string" }).notNull(),

    // Overall metrics
    avg_cost: doublePrecision("avg_cost").notNull(),
    median_cost: doublePrecision("median_cost").notNull(),
    avg_latency: integer("avg_latency").notNull(), // in milliseconds
    median_latency: integer("median_latency").notNull(), // in milliseconds
    total_proofs: integer("total_proofs").notNull(),
  },
  (table) => [unique("proofs_daily_stats_date_key").on(table.date)]
)

// Daily aggregated metrics per prover
export const proverDailyStats = pgTable(
  "prover_daily_stats",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    date: timestamp("date", { withTimezone: true, mode: "string" }).notNull(),
    team_id: uuid()
      .notNull()
      .references(() => teams.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    // Metrics
    avg_cost: doublePrecision("avg_cost").notNull(),
    median_cost: doublePrecision("median_cost").notNull(),
    avg_latency: integer("avg_latency").notNull(), // in milliseconds
    median_latency: integer("median_latency").notNull(), // in milliseconds
    total_proofs: integer("total_proofs").notNull(),
  },
  (table) => [
    unique("prover_daily_stats_date_team_key").on(table.date, table.team_id),
  ]
)

export const gpuPriceIndex = pgTable(
  "gpu_price_index",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    gpu_name: text("gpu_name").notNull(),
    hourly_price: numeric("hourly_price", {
      precision: 10,
      scale: 6,
    }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("gpu_price_index_gpu_name_created_at_unique").on(
      table.gpu_name,
      table.created_at
    ),
  ]
)

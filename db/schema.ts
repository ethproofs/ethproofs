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

// Define a custom type for 'bytea'
const bytea = customType<{
  data: string
  default: false
}>({
  dataType() {
    return "bytea"
  },
})

export const keyMode = pgEnum("key_mode", ["read", "write", "all", "upload"])

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
      using: sql`is_allowed_apikey(((current_setting('request.headers'::text, true))::json ->> 'ethkey'::text), '{all,read}'::key_mode[])`,
    }),
  ]
)

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
)

export const clusters = pgTable(
  "clusters",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    index: smallint(),
    nickname: text().notNull(),
    team_id: uuid()
      .notNull()
      .references(() => teams.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    description: text(),
    // TODO:TEAM - remove this field
    // DEPRECATED: use cluster_hardware table instead
    hardware: text(),
    cycle_type: varchar("cycle_type"),
    proof_type: varchar("proof_type"),
    is_open_source: boolean().notNull().default(false),
    is_multi_machine: boolean().notNull().default(false),
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
)

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
    zkvm_version_id: bigint({ mode: "number" })
      .notNull()
      .references(() => zkvmVersions.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    version: text().notNull(),
    description: text(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("cluster_versions_cluster_id_idx").on(table.cluster_id)]
)

export const clusterMachines = pgTable(
  "cluster_machines",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    cluster_version_id: bigint("cluster_version_id", {
      mode: "number",
    })
      .notNull()
      .references(() => clusterVersions.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    machine_id: bigint("machine_id", { mode: "number" })
      .notNull()
      .references(() => machines.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    machine_count: smallint("machine_count").notNull(),
    cloud_instance_id: bigint("cloud_instance_id", { mode: "number" })
      .notNull()
      .references(() => cloudInstances.id),
    cloud_instance_count: smallint("cloud_instance_count").notNull(),
  },
  (table) => [
    index("cluster_machines_cluster_version_id_idx").on(
      table.cluster_version_id
    ),
    index("cluster_machines_cloud_instance_id_idx").on(table.cloud_instance_id),
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
)

export const machines = pgTable(
  "machines",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    cpu_model: text(),
    cpu_cores: integer(),
    gpu_models: text().array(),
    gpu_count: integer().array(),
    gpu_memory_gb: integer().array(),
    memory_size_gb: integer().array(),
    memory_count: integer().array(),
    memory_type: text().array(),
    storage_size_gb: integer(),
    total_tera_flops: integer(),
    network_between_machines: text(),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
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
)

export const cloudProviders = pgTable("cloud_providers", {
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  name: text("name").notNull().unique(),
  display_name: text("display_name").notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
})

export const cloudInstances = pgTable(
  "cloud_instances",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    provider_id: bigint("provider_id", { mode: "number" })
      .notNull()
      .references(() => cloudProviders.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    instance_name: text("instance_name").notNull().unique(), // Instance name or machine ID
    region: text("region").notNull(), // Region or geolocation
    hourly_price: real("hourly_price").notNull(),
    cpu_arch: text("cpu_arch"), // CPU architecture (e.g., x86)
    cpu_cores: integer("cpu_cores").notNull(), // Number of CPU cores
    cpu_effective_cores: integer("cpu_effective_cores"), // Effective CPU cores (optional)
    cpu_name: text("cpu_name"), // Name of the CPU
    memory: decimal("memory", { precision: 10, scale: 2 }).notNull(), // Total memory (in GB)
    gpu_count: integer("gpu_count"), // Number of GPUs (optional)
    gpu_arch: text("gpu_arch"), // GPU architecture (optional)
    gpu_name: text("gpu_name"), // Name of the GPU (optional)
    gpu_memory: decimal("gpu_memory", { precision: 10, scale: 2 }), // Total GPU memory (in GB, optional)
    mobo_name: text("mobo_name"), // Motherboard name (optional, VastAI-specific)
    disk_name: text("disk_name"), // Disk name (optional, VastAI-specific)
    disk_space: decimal("disk_space", { precision: 10, scale: 2 }), // Total storage (in GB)
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(), // Timestamp when the record was created
    snapshot_date: timestamp("snapshot_date", {
      withTimezone: true,
      mode: "string",
    }), // Date when the pricing/specs were captured
  },
  () => [
    pgPolicy("Enable read access for all users", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`true`,
    }),
  ]
)

export const clusterBenchmarks = pgTable("cluster_benchmarks", {
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  cluster_id: uuid("cluster_id")
    .notNull()
    .references(() => clusters.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  benchmark_id: bigint({ mode: "number" })
    .notNull()
    .references(() => benchmarks.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  time_ms: integer("time_ms").notNull(),
  cost_usd: real("cost_usd").notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
})

export const benchmarks = pgTable("benchmarks", {
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  operation_type: text().notNull(),
  display_name: text().notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
})

export const recursiveRootProofs = pgTable(
  "recursive_root_proofs",
  {
    root_proof_id: integer("root_proof_id")
      .primaryKey()
      .generatedByDefaultAsIdentity(),
    block_number: bigint("block_number", { mode: "number" }).references(
      () => blocks.block_number,
      {
        onDelete: "cascade",
        onUpdate: "cascade",
      }
    ),
    root_proof: bytea("root_proof").notNull(),
    root_proof_size: bigint("root_proof_size", { mode: "number" }).notNull(),
    total_proof_size: bigint("total_proof_size", { mode: "number" }).notNull(),
    team_id: uuid()
      .notNull()
      .references(() => teams.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  () => [
    pgPolicy("Enable read access for all users", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`true`,
    }),
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
)

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
  release_date: timestamp("release_date", {
    withTimezone: true,
    mode: "string",
  }),
  created_at: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  })
    .defaultNow()
    .notNull(),
})

export const programs = pgTable(
  "programs",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    verifier_id: text("verifier_id").notNull().unique(),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
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
)

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
    proving_time: integer("proving_time"),
    program_id: bigint("program_id", { mode: "number" }).references(
      () => programs.id,
      {
        onDelete: "set null",
        onUpdate: "cascade",
      }
    ),
    size_bytes: bigint("size_bytes", { mode: "number" }),
  },
  (table) => [
    unique("unique_block_cluster_version").on(
      table.block_number,
      table.cluster_version_id
    ),
    index("proofs_cluster_version_id_idx").on(table.cluster_version_id),
    index("proofs_proved_timestamp_idx").on(table.proved_timestamp),
    index("proofs_created_at_idx").on(table.created_at),
    pgPolicy("Enable updates for users with an api key", {
      as: "permissive",
      for: "update",
      to: ["public"],
      using: sql`is_allowed_apikey(((current_setting('request.headers'::text, true))::json ->> 'ethkey'::text), '{all,write}'::key_mode[])`,
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
)

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
)

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
    protocol_soundness: severityLevel("protocol_soundness").notNull(),
    implementation_soundness: severityLevel(
      "implementation_soundness"
    ).notNull(),
    evm_stf_bytecode: severityLevel("evm_stf_bytecode").notNull(),
    quantum_security: severityLevel("quantum_security").notNull(),
    security_target_bits: integer("security_target_bits").notNull(),
    max_bounty_amount: bigint("max_bounty_amount", {
      mode: "number",
    }).notNull(),
    trusted_setup: boolean("trusted_setup").notNull().default(false),
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
)

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
      -- Calculate average cost per proof
      COALESCE(avg(cm.cloud_instance_count::double precision * ci.hourly_price * p.proving_time::double precision / (1000.0 * 60::numeric * 60::numeric)::double precision), 0::numeric::double precision) AS avg_cost_per_proof,
      -- Calculate median cost per proof
      COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY cm.cloud_instance_count::double precision * ci.hourly_price * p.proving_time::double precision / (1000.0 * 60::numeric * 60::numeric)::double precision), 0::numeric::double precision) AS median_cost_per_proof,
      -- Calculate average latency
      COALESCE(avg(p.proving_time), 0::numeric) AS avg_proving_time,
      -- Calculate median latency
      COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.proving_time), 0::numeric) AS median_proving_time
    FROM blocks b
    INNER JOIN proofs p ON b.block_number = p.block_number AND p.proof_status = 'proved'::text
    INNER JOIN cluster_versions cv ON p.cluster_version_id = cv.id
    INNER JOIN cluster_machines cm ON cv.id = cm.cluster_version_id
    INNER JOIN cloud_instances ci ON cm.cloud_instance_id = ci.id
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
      COALESCE(sum(cm.cloud_instance_count::double precision * ci.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) / NULLIF(count(p.proof_id), 0)::double precision, 0::double precision) AS avg_cost_per_proof,
      COALESCE(avg(p.proving_time), 0::numeric) AS avg_proving_time,
      count(p.proof_id) AS total_proofs,
      -- Multi-machine proofs
      COALESCE(sum(CASE WHEN c.is_multi_machine THEN (cm.cloud_instance_count::double precision * ci.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) ELSE 0 END) / NULLIF(sum(CASE WHEN c.is_multi_machine THEN 1 ELSE 0 END), 0)::double precision, 0::double precision) AS avg_cost_per_proof_multi,
      COALESCE(avg(CASE WHEN c.is_multi_machine THEN p.proving_time ELSE NULL END), 0::numeric) AS avg_proving_time_multi,
      sum(CASE WHEN c.is_multi_machine THEN 1 ELSE 0 END) AS total_proofs_multi,
      -- Single-machine proofs
      COALESCE(sum(CASE WHEN NOT c.is_multi_machine THEN (cm.cloud_instance_count::double precision * ci.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) ELSE 0 END) / NULLIF(sum(CASE WHEN NOT c.is_multi_machine THEN 1 ELSE 0 END), 0)::double precision, 0::double precision) AS avg_cost_per_proof_single,
      COALESCE(avg(CASE WHEN NOT c.is_multi_machine THEN p.proving_time ELSE NULL END), 0::numeric) AS avg_proving_time_single,
      sum(CASE WHEN NOT c.is_multi_machine THEN 1 ELSE 0 END) AS total_proofs_single
    FROM teams t
    LEFT JOIN proofs p ON t.id = p.team_id AND p.proof_status = 'proved'::text
    LEFT JOIN cluster_versions cv ON p.cluster_version_id = cv.id
    LEFT JOIN clusters c ON cv.cluster_id = c.id
    LEFT JOIN cluster_machines cm ON cv.id = cm.cluster_version_id
    LEFT JOIN cloud_instances ci ON cm.cloud_instance_id = ci.id
    GROUP BY t.id`
  )

export const clusterSummary = pgView("cluster_summary", {
  cluster_id: uuid("cluster_id"),
  cluster_nickname: text("cluster_nickname"),
  team_id: uuid("team_id"),
  avg_cost_per_proof: doublePrecision("avg_cost_per_proof"),
  avg_proving_time: numeric("avg_proving_time"),
})
  .with({ securityInvoker: true })
  .as(
    sql`
    SELECT c.id as cluster_id,
      c.nickname as cluster_nickname,
      c.team_id,
      COALESCE(sum(cm.cloud_instance_count::double precision * ci.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) / NULLIF(count(p.proof_id), 0)::double precision, 0::double precision) AS avg_cost_per_proof,
      avg(p.proving_time) AS avg_proving_time
    FROM clusters c
    LEFT JOIN cluster_versions cv ON c.id = cv.cluster_id
    LEFT JOIN proofs p ON cv.id = p.cluster_version_id AND p.proof_status = 'proved'::text
    LEFT JOIN cluster_machines cm ON cv.id = cm.cluster_version_id
    LEFT JOIN cloud_instances ci ON cm.cloud_instance_id = ci.id
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

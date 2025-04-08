import { sql } from "drizzle-orm"
import {
  bigint,
  check,
  customType,
  decimal,
  doublePrecision,
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

export const providerType = pgEnum("provider", ["aws", "vastai"])

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

export const cloudInstances = pgTable(
  "cloud_instances",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    provider: providerType().notNull().default("aws"),
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

export const blocks = pgTable(
  "blocks",
  {
    block_number: bigint("block_number", { mode: "number" })
      .primaryKey()
      .notNull(),
    timestamp: timestamp({ withTimezone: true, mode: "string" }).notNull(),
    gas_used: bigint("gas_used", { mode: "number" }).notNull(),
    transaction_count: smallint("transaction_count").notNull(),
    hash: text().notNull(),
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

export const clusterConfigurations = pgTable(
  "cluster_configurations",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    cluster_id: uuid("cluster_id")
      .notNull()
      .references(() => clusters.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    cluster_machine_id: bigint("cluster_machine_id", { mode: "number" })
      .notNull()
      .references(() => clusterMachines.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    cluster_machine_count: smallint("cluster_machine_count").notNull(),
    cloud_instance_id: bigint("cloud_instance_id", { mode: "number" })
      .notNull()
      .references(() => cloudInstances.id),
    cloud_instance_count: smallint("cloud_instance_count").notNull(),
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

export const clusterMachines = pgTable(
  "cluster_machines",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    gpu_models: text().array().notNull(),
    memory_gb: integer().notNull(),
    memory_specification: text().notNull(),
    network_configuration: text(),
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
    // DEPRECATED: use cluster_hardware table instead
    hardware: text(),
    cycle_type: varchar("cycle_type"),
    proof_type: varchar("proof_type"),
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
    cluster_id: uuid("cluster_id")
      .notNull()
      .references(() => clusters.id, {
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
    unique("unique_block_cluster").on(table.block_number, table.cluster_id),
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

export const recentSummary = pgView("recent_summary", {
  total_proven_blocks: bigint("total_proven_blocks", { mode: "number" }),
  avg_cost_per_proof: doublePrecision("avg_cost_per_proof"),
  avg_proving_time: numeric("avg_proving_time"),
})
  .with({ securityInvoker: true })
  .as(
    sql`
    SELECT count(DISTINCT b.block_number) AS total_proven_blocks,
      COALESCE(avg(cc.cloud_instance_count::double precision * c.hourly_price * p.proving_time::double precision / (1000.0 * 60::numeric * 60::numeric)::double precision), 0::numeric::double precision) AS avg_cost_per_proof,
      COALESCE(avg(p.proving_time), 0::numeric) AS avg_proving_time
    FROM blocks b
    INNER JOIN proofs p ON b.block_number = p.block_number AND p.proof_status = 'proved'::text
    INNER JOIN cluster_configurations cc ON p.cluster_id = cc.cluster_id
    INNER JOIN cloud_instances c ON cc.cloud_instance_id = c.id
    WHERE b."timestamp" >= (now() - '30 days'::interval)`
  )

export const teamsSummary = pgView("teams_summary", {
  team_id: uuid("team_id"),
  team_name: text("team_name"),
  logo_url: text("logo_url"),
  avg_cost_per_proof: doublePrecision("avg_cost_per_proof"),
  avg_proving_time: numeric("avg_proving_time"),
})
  .with({ securityInvoker: true })
  .as(
    sql`
    SELECT t.id as team_id,
      t.name as team_name,
      t.logo_url,
      COALESCE(sum(cc.cloud_instance_count::double precision * c.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) / NULLIF(count(p.proof_id), 0)::double precision, 0::double precision) AS avg_cost_per_proof,
      avg(p.proving_time) AS avg_proving_time
    FROM teams t 
    LEFT JOIN proofs p ON t.id = p.team_id AND p.proof_status = 'proved'::text 
    LEFT JOIN cluster_configurations cc ON p.cluster_id = cc.cluster_id 
    LEFT JOIN cloud_instances c ON cc.cloud_instance_id = c.id 
    GROUP BY t.id`
  )

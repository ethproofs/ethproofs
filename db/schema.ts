import {
  pgTable,
  pgPolicy,
  bigint,
  varchar,
  real,
  smallint,
  timestamp,
  text,
  uuid,
  integer,
  unique,
  check,
  pgView,
  doublePrecision,
  pgEnum,
  customType,
  numeric,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
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
    user_id: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, {
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

export const awsInstancePricing = pgTable(
  "aws_instance_pricing",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    instance_type: varchar("instance_type").notNull(),
    region: varchar().notNull(),
    hourly_price: real("hourly_price").notNull(),
    instance_memory: real("instance_memory").notNull(),
    vcpu: smallint().notNull(),
    instance_storage: varchar("instance_storage").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
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
    instance_type_id: bigint("instance_type_id", { mode: "number" })
      .notNull()
      .references(() => awsInstancePricing.id),
    instance_count: smallint("instance_count").notNull(),
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
    user_id: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, {
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
    team_id: integer("team_id").primaryKey().generatedByDefaultAsIdentity(),
    team_name: text("team_name").notNull(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    github_org: text("github_org"),
    logo_url: text("logo_url"),
    twitter_handle: text("twitter_handle"),
    website_url: text("website_url"),
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
    user_id: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    description: text(),
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
    user_id: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, {
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

export const proofBinaries = pgTable(
  "proof_binaries",
  {
    proof_id: integer("proof_id")
      .primaryKey()
      .references(() => proofs.proof_id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    proof_binary: bytea("proof_binary").notNull(),
  },
  () => [
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
      COALESCE(avg(cc.instance_count::double precision * a.hourly_price * p.proving_time::double precision / (1000.0 * 60::numeric * 60::numeric)::double precision), 0::numeric::double precision) AS avg_cost_per_proof,
      COALESCE(avg(p.proving_time), 0::numeric) AS avg_proving_time
    FROM blocks b
    INNER JOIN proofs p ON b.block_number = p.block_number AND p.proof_status = 'proved'::text
    INNER JOIN cluster_configurations cc ON p.cluster_id = cc.cluster_id
    INNER JOIN aws_instance_pricing a ON cc.instance_type_id = a.id
    WHERE b."timestamp" >= (now() - '30 days'::interval)`
  )

export const teamsSummary = pgView("teams_summary", {
  team_id: integer("team_id"),
  team_name: text("team_name"),
  logo_url: text("logo_url"),
  avg_cost_per_proof: doublePrecision("avg_cost_per_proof"),
  avg_proving_time: numeric("avg_proving_time"),
})
  .with({ securityInvoker: true })
  .as(
    sql`
    SELECT t.team_id,
      t.team_name,
      t.logo_url,
      COALESCE(sum(cc.instance_count::double precision * a.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) / NULLIF(count(p.proof_id), 0)::double precision, 0::double precision) AS avg_cost_per_proof,
      avg(p.proving_time) AS avg_proving_time
    FROM teams t 
    LEFT JOIN proofs p ON t.user_id = p.user_id AND p.proof_status = 'proved'::text 
    LEFT JOIN cluster_configurations cc ON p.cluster_id = cc.cluster_id 
    LEFT JOIN aws_instance_pricing a ON cc.instance_type_id = a.id 
    GROUP BY t.team_id`
  )

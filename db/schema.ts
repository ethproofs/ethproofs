import {
  pgTable,
  pgPolicy,
  bigint,
  varchar,
  real,
  smallint,
  timestamp,
  text,
  foreignKey,
  uuid,
  integer,
  unique,
  check,
  pgView,
  doublePrecision,
  numeric,
  pgEnum,
  customType,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { authUsers } from "drizzle-orm/supabase"

// Define a custom type for 'bytea'
const bytea = customType<{
  data: Buffer
  default: false
}>({
  dataType() {
    return "bytea"
  },
})

export const keyMode = pgEnum("key_mode", ["read", "write", "all", "upload"])

export const awsInstancePricing = pgTable(
  "aws_instance_pricing",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    instanceType: varchar("instance_type").notNull(),
    region: varchar().notNull(),
    hourlyPrice: real("hourly_price").notNull(),
    instanceMemory: real("instance_memory").notNull(),
    vcpu: smallint().notNull(),
    instanceStorage: varchar("instance_storage").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
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
    blockNumber: bigint("block_number", { mode: "number" })
      .primaryKey()
      .notNull(),
    timestamp: timestamp({ withTimezone: true, mode: "string" }).notNull(),
    gasUsed: bigint("gas_used", { mode: "number" }).notNull(),
    transactionCount: smallint("transaction_count").notNull(),
    hash: text().notNull(),
  },
  (table) => [
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
    clusterId: uuid("cluster_id").notNull(),
    instanceTypeId: bigint("instance_type_id", { mode: "number" }).notNull(),
    instanceCount: smallint("instance_count").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.clusterId],
      foreignColumns: [clusters.id],
      name: "cluster_configurations_cluster_id_fkey",
    }),
    foreignKey({
      columns: [table.instanceTypeId],
      foreignColumns: [awsInstancePricing.id],
      name: "cluster_configurations_instance_type_id_fkey",
    }),
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
    rootProofId: integer("root_proof_id")
      .primaryKey()
      .generatedByDefaultAsIdentity(),
    blockNumber: bigint("block_number", { mode: "number" }),
    rootProof: bytea("root_proof").notNull(),
    rootProofSize: bigint("root_proof_size", { mode: "number" }).notNull(),
    totalProofSize: bigint("total_proof_size", { mode: "number" }).notNull(),
    userId: uuid("user_id"),
  },
  (table) => [
    foreignKey({
      columns: [table.blockNumber],
      foreignColumns: [blocks.blockNumber],
      name: "recursive_root_proofs_block_number_fkey",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [authUsers.id],
      name: "recursive_root_proofs_user_id_fkey",
    }),
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
    teamId: integer("team_id").primaryKey().generatedByDefaultAsIdentity(),
    teamName: text("team_name").notNull(),
    userId: uuid("user_id"),
    githubOrg: text("github_org"),
    logoUrl: text("logo_url"),
    twitterHandle: text("twitter_handle"),
    websiteUrl: text("website_url"),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [authUsers.id],
      name: "teams_user_id_fkey",
    }).onDelete("set null"),
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
    index: smallint(),
    nickname: text().notNull(),
    userId: uuid("user_id").notNull(),
    id: uuid().defaultRandom().primaryKey().notNull(),
    description: text(),
    hardware: text(),
    cycleType: varchar("cycle_type"),
    proofType: varchar("proof_type"),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [authUsers.id],
      name: "clusters_user_id_fkey",
    }).onDelete("set null"),
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
    verifierId: text("verifier_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("programs_verifier_id_key").on(table.verifierId),
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

export const apiAuthTokens = pgTable(
  "api_auth_tokens",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    mode: keyMode().default("read").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    token: text().notNull(),
    userId: uuid("user_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [authUsers.id],
      name: "api_auth_tokens_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    unique("api_auth_tokens_token_key").on(table.token),
    pgPolicy("Allow users to see API token entries they own", {
      as: "permissive",
      for: "select",
      to: ["anon"],
      using: sql`is_allowed_apikey(((current_setting('request.headers'::text, true))::json ->> 'ethkey'::text), '{all,read}'::key_mode[])`,
    }),
  ]
)

export const proofs = pgTable(
  "proofs",
  {
    proofId: integer("proof_id").primaryKey().generatedByDefaultAsIdentity(),
    blockNumber: bigint("block_number", { mode: "number" }).notNull(),
    proof: bytea("proof"),
    proofStatus: text("proof_status").notNull(),
    provingCycles: bigint("proving_cycles", { mode: "number" }),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    provedTimestamp: timestamp("proved_timestamp", {
      withTimezone: true,
      mode: "string",
    }),
    provingTimestamp: timestamp("proving_timestamp", {
      withTimezone: true,
      mode: "string",
    }),
    queuedTimestamp: timestamp("queued_timestamp", {
      withTimezone: true,
      mode: "string",
    }),
    clusterId: uuid("cluster_id").notNull(),
    provingTime: integer("proving_time"),
    programId: bigint("program_id", { mode: "number" }),
    size: bigint({ mode: "number" }),
  },
  (table) => [
    foreignKey({
      columns: [table.blockNumber],
      foreignColumns: [blocks.blockNumber],
      name: "proofs_block_number_fkey",
    }),
    foreignKey({
      columns: [table.clusterId],
      foreignColumns: [clusters.id],
      name: "proofs_cluster_id_fkey",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [authUsers.id],
      name: "proofs_user_id_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.programId],
      foreignColumns: [programs.id],
      name: "proofs_program_id_fkey",
    }),
    unique("unique_block_cluster").on(table.blockNumber, table.clusterId),
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
  totalProvenBlocks: bigint("total_proven_blocks", { mode: "number" }),
  avgCostPerProof: doublePrecision("avg_cost_per_proof"),
  avgProvingTime: numeric("avg_proving_time"),
})
  .with({ securityInvoker: true })
  .as(
    sql`SELECT 
	count(DISTINCT b.block_number) AS total_proven_blocks, 
	COALESCE(avg(cc.instance_count::double precision * a.hourly_price * p.proving_time::double precision / (1000.0 * 60::numeric * 60::numeric)::double precision), 0::numeric::double precision) AS avg_cost_per_proof, 
	COALESCE(avg(p.proving_time), 0::numeric) AS avg_proving_time 
	FROM blocks b 
	JOIN proofs p ON b.block_number = p.block_number AND p.proof_status = 'proved'::text 
	JOIN cluster_configurations cc ON p.cluster_id = cc.cluster_id 
	JOIN aws_instance_pricing a ON cc.instance_type_id = a.id 
	WHERE b."timestamp" >= (now() - '30 days'::interval)`
  )

export const teamsSummary = pgView("teams_summary", {
  teamId: integer("team_id"),
  teamName: text("team_name"),
  logoUrl: text("logo_url"),
  avgCostPerProof: doublePrecision("avg_cost_per_proof"),
  avgProvingTime: numeric("avg_proving_time"),
})
  .with({ securityInvoker: true })
  .as(
    sql`SELECT
	t.team_id,
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

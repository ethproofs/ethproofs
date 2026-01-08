-- Create prover_types reference table
CREATE TABLE IF NOT EXISTS "prover_types" (
  "id" smallint PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "processing_ratio" text NOT NULL,
  "gpu_configuration" text NOT NULL,
  "deployment_type" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "prover_types_name_unique" UNIQUE("name")
);

-- Insert the 4 prover type definitions
INSERT INTO "prover_types" ("id", "name", "processing_ratio", "gpu_configuration", "deployment_type") VALUES
  (1, '1:1 Multi-GPU Cloud', '1:1', 'multi-gpu', 'cloud-hosted'),
  (2, '1:1 Multi-GPU On-Prem', '1:1', 'multi-gpu', 'on-prem'),
  (3, '1:100 Single-GPU Cloud', '1:100', 'single-gpu', 'cloud-hosted'),
  (4, '1:100 Single-GPU On-Prem', '1:100', 'single-gpu', 'on-prem');

-- Add prover_type_id column to clusters table
ALTER TABLE "clusters" ADD COLUMN "prover_type_id" smallint;

-- Backfill existing clusters with prover_type_id based on num_gpus
-- Multi-GPU clusters (num_gpus > 1) get type 1 (1:1 Multi-GPU Cloud)
-- Single-GPU clusters (num_gpus = 1) get type 3 (1:100 Single-GPU Cloud)
UPDATE "clusters"
SET "prover_type_id" = CASE
  WHEN "num_gpus" > 1 THEN 1
  ELSE 3
END;

-- Handle teams with multiple active clusters of the same GPU configuration
-- For each team with duplicate active clusters, set the second one to on-prem variant
WITH ranked_clusters AS (
  SELECT
    "id",
    "team_id",
    "num_gpus",
    "is_active",
    "prover_type_id",
    ROW_NUMBER() OVER (
      PARTITION BY "team_id",
      CASE WHEN "num_gpus" > 1 THEN 'multi' ELSE 'single' END,
      "is_active"
      ORDER BY "created_at" ASC
    ) AS row_num
  FROM "clusters"
  WHERE "is_active" = true
)
UPDATE "clusters" c
SET "prover_type_id" = CASE
  WHEN rc."prover_type_id" = 1 THEN 2
  WHEN rc."prover_type_id" = 3 THEN 4
END
FROM ranked_clusters rc
WHERE c."id" = rc."id"
  AND rc.row_num > 1;

-- Add foreign key constraint
ALTER TABLE "clusters" ADD CONSTRAINT "clusters_prover_type_id_prover_types_id_fk"
  FOREIGN KEY ("prover_type_id") REFERENCES "prover_types"("id") ON DELETE no action ON UPDATE no action;

-- Create partial unique index to enforce one active prover per type per team
CREATE UNIQUE INDEX IF NOT EXISTS "unique_active_prover_per_type_per_team"
  ON "clusters" ("team_id", "prover_type_id")
  WHERE "is_active" = true;

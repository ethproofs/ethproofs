-- Add index column to cluster_versions for per-cluster version numbering
ALTER TABLE "public"."cluster_versions" ADD COLUMN "index" smallint;

-- Backfill index values: number versions per cluster starting at 1
WITH indexed_versions AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY cluster_id ORDER BY created_at ASC) as version_index
  FROM "public"."cluster_versions"
)
UPDATE "public"."cluster_versions" cv
SET "index" = iv.version_index
FROM indexed_versions iv
WHERE cv.id = iv.id;

-- Make index NOT NULL after backfilling
ALTER TABLE "public"."cluster_versions" ALTER COLUMN "index" SET NOT NULL;

-- Set all existing versions to active for backward compatibility
UPDATE "public"."cluster_versions" SET "is_active" = true WHERE "is_active" IS NOT true;

-- Add unique constraint to ensure unique indices per cluster
ALTER TABLE "public"."cluster_versions" ADD CONSTRAINT "cluster_versions_cluster_id_index_uk" UNIQUE ("cluster_id", "index");
-- Remove version and description columns, add vk_path and is_active
ALTER TABLE "public"."cluster_versions" DROP COLUMN "version";
ALTER TABLE "public"."cluster_versions" DROP COLUMN "description";
ALTER TABLE "public"."cluster_versions" ADD COLUMN "vk_path" text;
ALTER TABLE "public"."cluster_versions" ADD COLUMN "is_active" boolean NOT NULL DEFAULT false;

-- Add index for efficient active version lookup
CREATE INDEX "cluster_versions_cluster_id_is_active_idx" ON "public"."cluster_versions"("cluster_id", "is_active");
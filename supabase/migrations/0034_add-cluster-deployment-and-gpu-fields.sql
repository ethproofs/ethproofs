-- Add deployment_type and gpu_count fields to clusters table
ALTER TABLE "clusters"
ADD COLUMN "deployment_type" varchar,
ADD COLUMN "gpu_count" integer;

-- Add comments for documentation
COMMENT ON COLUMN "clusters"."deployment_type" IS 'Deployment type: "cloud" or "on-premise"';
COMMENT ON COLUMN "clusters"."gpu_count" IS 'Total number of GPUs in the cluster';


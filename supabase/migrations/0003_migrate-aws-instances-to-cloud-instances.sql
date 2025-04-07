CREATE TYPE "public"."provider" AS ENUM('aws', 'vastai');--> statement-breakpoint
DROP VIEW "public"."recent_summary";--> statement-breakpoint
DROP VIEW "public"."teams_summary";--> statement-breakpoint
ALTER TABLE "aws_instance_pricing" RENAME TO "cloud_instances";--> statement-breakpoint
ALTER TABLE "cloud_instances" RENAME COLUMN "instance_type" TO "instance_name";--> statement-breakpoint
ALTER TABLE "cloud_instances" RENAME COLUMN "vcpu" TO "cpu_cores";--> statement-breakpoint
ALTER TABLE "cloud_instances" RENAME COLUMN "instance_memory" TO "memory";--> statement-breakpoint
ALTER TABLE "cloud_instances" RENAME COLUMN "instance_storage" TO "disk_name";--> statement-breakpoint
ALTER TABLE "cluster_configurations" RENAME COLUMN "instance_type_id" TO "cloud_instance_id";--> statement-breakpoint
ALTER TABLE "cluster_configurations" RENAME COLUMN "instance_count" TO "cloud_instance_count";--> statement-breakpoint
ALTER TABLE "cluster_configurations" DROP CONSTRAINT "cluster_configurations_instance_type_id_aws_instance_pricing_id_fk";
--> statement-breakpoint
ALTER TABLE "cloud_instances" ALTER COLUMN "region" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "cloud_instances" ADD COLUMN "provider" "provider" DEFAULT 'aws' NOT NULL;--> statement-breakpoint
ALTER TABLE "cloud_instances" ADD COLUMN "cpu_arch" text;--> statement-breakpoint
ALTER TABLE "cloud_instances" ADD COLUMN "cpu_effective_cores" integer;--> statement-breakpoint
ALTER TABLE "cloud_instances" ADD COLUMN "cpu_name" text;--> statement-breakpoint
ALTER TABLE "cloud_instances" ADD COLUMN "gpu_count" integer;--> statement-breakpoint
ALTER TABLE "cloud_instances" ADD COLUMN "gpu_arch" text;--> statement-breakpoint
ALTER TABLE "cloud_instances" ADD COLUMN "gpu_name" text;--> statement-breakpoint
ALTER TABLE "cloud_instances" ADD COLUMN "gpu_memory" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "cloud_instances" ADD COLUMN "mobo_name" text;--> statement-breakpoint
ALTER TABLE "cloud_instances" ADD COLUMN "disk_space" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "cloud_instances" ADD COLUMN "snapshot_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "cloud_instances" RENAME CONSTRAINT "aws_instance_pricing_pkey" TO "cloud_instances_pkey";
ALTER TABLE "cluster_configurations" ADD CONSTRAINT "cluster_configurations_cloud_instance_id_cloud_instances_id_fk" FOREIGN KEY ("cloud_instance_id") REFERENCES "public"."cloud_instances"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cloud_instances" ADD CONSTRAINT "cloud_instances_instance_name_unique" UNIQUE("instance_name");--> statement-breakpoint
CREATE VIEW "public"."recent_summary" WITH (security_invoker = true) AS (
    SELECT count(DISTINCT b.block_number) AS total_proven_blocks,
      COALESCE(avg(cc.cloud_instance_count::double precision * c.hourly_price * p.proving_time::double precision / (1000.0 * 60::numeric * 60::numeric)::double precision), 0::numeric::double precision) AS avg_cost_per_proof,
      COALESCE(avg(p.proving_time), 0::numeric) AS avg_proving_time
    FROM blocks b
    INNER JOIN proofs p ON b.block_number = p.block_number AND p.proof_status = 'proved'::text
    INNER JOIN cluster_configurations cc ON p.cluster_id = cc.cluster_id
    INNER JOIN cloud_instances c ON cc.cloud_instance_id = c.id
    WHERE b."timestamp" >= (now() - '30 days'::interval));--> statement-breakpoint
CREATE VIEW "public"."teams_summary" WITH (security_invoker = true) AS (
    SELECT t.id as team_id,
      t.name as team_name,
      t.logo_url,
      COALESCE(sum(cc.cloud_instance_count::double precision * c.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) / NULLIF(count(p.proof_id), 0)::double precision, 0::double precision) AS avg_cost_per_proof,
      avg(p.proving_time) AS avg_proving_time
    FROM teams t 
    LEFT JOIN proofs p ON t.id = p.team_id AND p.proof_status = 'proved'::text 
    LEFT JOIN cluster_configurations cc ON p.cluster_id = cc.cluster_id 
    LEFT JOIN cloud_instances c ON cc.cloud_instance_id = c.id 
    GROUP BY t.id);
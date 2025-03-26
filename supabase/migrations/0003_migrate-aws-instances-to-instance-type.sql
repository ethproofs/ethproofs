CREATE TYPE "public"."provider" AS ENUM('aws', 'vastai');--> statement-breakpoint
ALTER TABLE "aws_instance_pricing" RENAME TO "instance_types";--> statement-breakpoint
ALTER TABLE "instance_types" RENAME COLUMN "instance_type" TO "instance_name";--> statement-breakpoint
ALTER TABLE "instance_types" RENAME COLUMN "vcpu" TO "cpu_cores";--> statement-breakpoint
ALTER TABLE "instance_types" RENAME COLUMN "instance_memory" TO "memory";--> statement-breakpoint
ALTER TABLE "instance_types" RENAME COLUMN "instance_storage" TO "disk_name";--> statement-breakpoint
ALTER TABLE "cluster_configurations" DROP CONSTRAINT "cluster_configurations_instance_type_id_aws_instance_pricing_id_fk";
--> statement-breakpoint
ALTER TABLE "instance_types" ALTER COLUMN "region" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "instance_types" ADD COLUMN "provider" "provider" DEFAULT 'aws' NOT NULL;--> statement-breakpoint
ALTER TABLE "instance_types" ADD COLUMN "cpu_arch" text;--> statement-breakpoint
ALTER TABLE "instance_types" ADD COLUMN "cpu_effective_cores" integer;--> statement-breakpoint
ALTER TABLE "instance_types" ADD COLUMN "cpu_name" text;--> statement-breakpoint
ALTER TABLE "instance_types" ADD COLUMN "gpu_count" integer;--> statement-breakpoint
ALTER TABLE "instance_types" ADD COLUMN "gpu_arch" text;--> statement-breakpoint
ALTER TABLE "instance_types" ADD COLUMN "gpu_name" text;--> statement-breakpoint
ALTER TABLE "instance_types" ADD COLUMN "gpu_memory" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "instance_types" ADD COLUMN "mobo_name" text;--> statement-breakpoint
ALTER TABLE "instance_types" ADD COLUMN "disk_space" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "instance_types" ADD COLUMN "snapshot_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "cluster_configurations" ADD CONSTRAINT "cluster_configurations_instance_type_id_instance_types_id_fk" FOREIGN KEY ("instance_type_id") REFERENCES "public"."instance_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance_types" ADD CONSTRAINT "unique_instance_name_provider" UNIQUE("instance_name","provider");
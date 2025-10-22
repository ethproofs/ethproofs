ALTER TABLE "vendors" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "vendors" CASCADE;--> statement-breakpoint
--> statement-breakpoint
ALTER TABLE "zkvms" ALTER COLUMN "team_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" DROP COLUMN "is_prover";--> statement-breakpoint
ALTER TABLE "teams" DROP COLUMN "is_zkvm_provider";--> statement-breakpoint
ALTER TABLE "zkvms" DROP COLUMN "vendor_id";

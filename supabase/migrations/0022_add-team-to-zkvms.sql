ALTER TABLE "teams" ADD COLUMN "is_prover" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "is_zkvm_provider" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "zkvms" ADD COLUMN "team_id" uuid;--> statement-breakpoint
ALTER TABLE "zkvms" ADD CONSTRAINT "zkvms_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE cascade;
DROP POLICY "Enable updates for users with an api key" ON "proof_binaries" CASCADE;--> statement-breakpoint
DROP POLICY "Enable read access for all users" ON "proof_binaries" CASCADE;--> statement-breakpoint
DROP POLICY "Enable insert for users with an api key" ON "proof_binaries" CASCADE;--> statement-breakpoint
DROP TABLE "proof_binaries" CASCADE;
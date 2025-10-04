ALTER TABLE "blocks" ALTER COLUMN "timestamp" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "blocks" ALTER COLUMN "gas_used" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "blocks" ALTER COLUMN "transaction_count" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "blocks" ALTER COLUMN "hash" DROP NOT NULL;
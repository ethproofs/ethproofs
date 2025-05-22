ALTER TABLE "teams" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "zkvms" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "zkvms" ADD CONSTRAINT "zkvms_slug_unique" UNIQUE("slug");
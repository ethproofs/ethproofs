ALTER TABLE "teams" RENAME COLUMN "approved" TO "is_approved";
ALTER TABLE "zkvms" RENAME COLUMN "approved" TO "is_approved";
ALTER TABLE "clusters" ADD COLUMN "is_approved" boolean DEFAULT true NOT NULL;
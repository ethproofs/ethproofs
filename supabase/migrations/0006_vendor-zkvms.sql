CREATE TABLE "vendors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"github_org" text,
	"logo_url" text,
	"twitter_handle" text,
	"website_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "vendors" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "zkvm_versions" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "zkvm_versions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"zkvm_id" bigint NOT NULL,
	"version" text NOT NULL,
	"release_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "zkvm_versions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "zkvms" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "zkvms_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"vendor_id" uuid NOT NULL,
	"name" text NOT NULL,
	"isa" text NOT NULL,
	"repo_url" text NOT NULL,
	"continuations" boolean DEFAULT false NOT NULL,
	"parallelizable_proving" boolean DEFAULT false NOT NULL,
	"precompiles" boolean DEFAULT false NOT NULL,
	"frontend" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "zkvms" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "cluster_versions" ADD COLUMN "zkvm_version_id" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "zkvm_versions" ADD CONSTRAINT "zkvm_versions_zkvm_id_zkvms_id_fk" FOREIGN KEY ("zkvm_id") REFERENCES "public"."zkvms"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "zkvms" ADD CONSTRAINT "zkvms_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "cluster_versions" ADD CONSTRAINT "cluster_versions_zkvm_version_id_zkvm_versions_id_fk" FOREIGN KEY ("zkvm_version_id") REFERENCES "public"."zkvm_versions"("id") ON DELETE cascade ON UPDATE cascade;
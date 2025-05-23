CREATE TYPE "public"."key_mode" AS ENUM('read', 'write', 'all', 'upload');--> statement-breakpoint
CREATE TABLE "api_auth_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mode" "key_mode" DEFAULT 'read' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"token" text NOT NULL,
	"team_id" uuid NOT NULL,
	CONSTRAINT "api_auth_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "api_auth_tokens" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "aws_instance_pricing" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "aws_instance_pricing_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"instance_type" varchar NOT NULL,
	"region" varchar NOT NULL,
	"hourly_price" real NOT NULL,
	"instance_memory" real NOT NULL,
	"vcpu" smallint NOT NULL,
	"instance_storage" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "aws_instance_pricing" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "blocks" (
	"block_number" bigint PRIMARY KEY NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"gas_used" bigint NOT NULL,
	"transaction_count" smallint NOT NULL,
	"hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blocks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "cluster_configurations" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "cluster_configurations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"cluster_id" uuid NOT NULL,
	"instance_type_id" bigint NOT NULL,
	"instance_count" smallint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cluster_configurations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "clusters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"index" smallint,
	"nickname" text NOT NULL,
	"team_id" uuid NOT NULL,
	"description" text,
	"hardware" text,
	"cycle_type" varchar,
	"proof_type" varchar,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clusters" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "programs" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "programs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"verifier_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "programs_verifier_id_unique" UNIQUE("verifier_id")
);
--> statement-breakpoint
ALTER TABLE "programs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "proof_binaries" (
	"proof_id" integer PRIMARY KEY NOT NULL,
	"proof_binary" "bytea" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "proof_binaries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "proofs" (
	"proof_id" integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "proofs_proof_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"block_number" bigint NOT NULL,
	"proof_status" text NOT NULL,
	"proving_cycles" bigint,
	"team_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"proved_timestamp" timestamp with time zone,
	"proving_timestamp" timestamp with time zone,
	"queued_timestamp" timestamp with time zone,
	"cluster_id" uuid NOT NULL,
	"proving_time" integer,
	"program_id" bigint,
	"size_bytes" bigint,
	CONSTRAINT "unique_block_cluster" UNIQUE("block_number","cluster_id"),
	CONSTRAINT "proofs_proof_status_check" CHECK (proof_status = ANY (ARRAY['queued'::text, 'proving'::text, 'proved'::text]))
);
--> statement-breakpoint
ALTER TABLE "proofs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "recursive_root_proofs" (
	"root_proof_id" integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "recursive_root_proofs_root_proof_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"block_number" bigint,
	"root_proof" "bytea" NOT NULL,
	"root_proof_size" bigint NOT NULL,
	"total_proof_size" bigint NOT NULL,
	"team_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recursive_root_proofs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"github_org" text,
	"logo_url" text,
	"twitter_handle" text,
	"website_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- CUSTOM FUNCTIONS

CREATE FUNCTION "public"."is_allowed_apikey"("apikey" "text", "keymode" "public"."key_mode"[]) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$Begin
  RETURN (SELECT EXISTS (SELECT 1
  FROM api_auth_tokens
  WHERE token=apikey
  AND mode=ANY(keymode)));
End;$$;

CREATE FUNCTION "public"."generate_cluster_index"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    next_index INTEGER;
BEGIN
    -- Get the next available index for the user
    SELECT COALESCE(MAX(index), 0) + 1 INTO next_index
    FROM clusters
    WHERE team_id = NEW.team_id;

    -- Assign the index
    NEW.index = next_index;
    RETURN NEW;
END;
$$;

CREATE TRIGGER "set_cluster_index" BEFORE INSERT ON "public"."clusters" FOR EACH ROW EXECUTE FUNCTION "public"."generate_cluster_index"();

ALTER TABLE "teams" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "api_auth_tokens" ADD CONSTRAINT "api_auth_tokens_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "cluster_configurations" ADD CONSTRAINT "cluster_configurations_cluster_id_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."clusters"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "cluster_configurations" ADD CONSTRAINT "cluster_configurations_instance_type_id_aws_instance_pricing_id_fk" FOREIGN KEY ("instance_type_id") REFERENCES "public"."aws_instance_pricing"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clusters" ADD CONSTRAINT "clusters_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "proof_binaries" ADD CONSTRAINT "proof_binaries_proof_id_proofs_proof_id_fk" FOREIGN KEY ("proof_id") REFERENCES "public"."proofs"("proof_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "proofs" ADD CONSTRAINT "proofs_block_number_blocks_block_number_fk" FOREIGN KEY ("block_number") REFERENCES "public"."blocks"("block_number") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proofs" ADD CONSTRAINT "proofs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "proofs" ADD CONSTRAINT "proofs_cluster_id_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."clusters"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "proofs" ADD CONSTRAINT "proofs_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "recursive_root_proofs" ADD CONSTRAINT "recursive_root_proofs_block_number_blocks_block_number_fk" FOREIGN KEY ("block_number") REFERENCES "public"."blocks"("block_number") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "recursive_root_proofs" ADD CONSTRAINT "recursive_root_proofs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE VIEW "public"."recent_summary" WITH (security_invoker = true) AS (
    SELECT count(DISTINCT b.block_number) AS total_proven_blocks,
      COALESCE(avg(cc.instance_count::double precision * a.hourly_price * p.proving_time::double precision / (1000.0 * 60::numeric * 60::numeric)::double precision), 0::numeric::double precision) AS avg_cost_per_proof,
      COALESCE(avg(p.proving_time), 0::numeric) AS avg_proving_time
    FROM blocks b
    INNER JOIN proofs p ON b.block_number = p.block_number AND p.proof_status = 'proved'::text
    INNER JOIN cluster_configurations cc ON p.cluster_id = cc.cluster_id
    INNER JOIN aws_instance_pricing a ON cc.instance_type_id = a.id
    WHERE b."timestamp" >= (now() - '30 days'::interval));--> statement-breakpoint
CREATE VIEW "public"."teams_summary" WITH (security_invoker = true) AS (
    SELECT t.id as team_id,
      t.name as team_name,
      t.logo_url,
      COALESCE(sum(cc.instance_count::double precision * a.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) / NULLIF(count(p.proof_id), 0)::double precision, 0::double precision) AS avg_cost_per_proof,
      avg(p.proving_time) AS avg_proving_time
    FROM teams t 
    LEFT JOIN proofs p ON t.id = p.team_id AND p.proof_status = 'proved'::text 
    LEFT JOIN cluster_configurations cc ON p.cluster_id = cc.cluster_id 
    LEFT JOIN aws_instance_pricing a ON cc.instance_type_id = a.id 
    GROUP BY t.id);--> statement-breakpoint
CREATE POLICY "Allow users to see API token entries they own" ON "api_auth_tokens" AS PERMISSIVE FOR SELECT TO "anon" USING (is_allowed_apikey(((current_setting('request.headers'::text, true))::json ->> 'ethkey'::text), '{all,read}'::key_mode[]));--> statement-breakpoint
CREATE POLICY "Enable read access for all users" ON "aws_instance_pricing" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "Enable read access for all users" ON "blocks" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "Enable insert for users with an api key" ON "blocks" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Enable read access for all users" ON "cluster_configurations" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "Enable insert for users with an api key" ON "cluster_configurations" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Enable read access for all users" ON "clusters" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "Enable insert for users with an api key" ON "clusters" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Enable read access for all users" ON "programs" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "Enable insert for users with an api key" ON "programs" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Enable updates for users with an api key" ON "proof_binaries" AS PERMISSIVE FOR UPDATE TO public USING (is_allowed_apikey(((current_setting('request.headers'::text, true))::json ->> 'ethkey'::text), '{all,write}'::key_mode[]));--> statement-breakpoint
CREATE POLICY "Enable read access for all users" ON "proof_binaries" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Enable insert for users with an api key" ON "proof_binaries" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Enable updates for users with an api key" ON "proofs" AS PERMISSIVE FOR UPDATE TO public USING (is_allowed_apikey(((current_setting('request.headers'::text, true))::json ->> 'ethkey'::text), '{all,write}'::key_mode[]));--> statement-breakpoint
CREATE POLICY "Enable read access for all users" ON "proofs" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Enable insert for users with an api key" ON "proofs" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Enable read access for all users" ON "recursive_root_proofs" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "Enable read access for all users" ON "teams" AS PERMISSIVE FOR SELECT TO public USING (true);

-- inserts a row into public.teams
-- https://supabase.com/docs/guides/auth/managing-user-data
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.teams (id, name)
  values (new.id, new.email);
  return new;
end;
$$;

-- trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
-- CreateEnum
CREATE TYPE "key_modes" AS ENUM ('read', 'write', 'all', 'upload');

-- CreateTable
CREATE TABLE "api_auth_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "token" TEXT NOT NULL,
    "team_id" UUID NOT NULL,
    "mode" "key_modes" NOT NULL DEFAULT 'read',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_auth_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aws_instance_pricing" (
    "id" BIGSERIAL NOT NULL,
    "instance_type" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "hourly_price" DOUBLE PRECISION NOT NULL,
    "instance_memory" DOUBLE PRECISION NOT NULL,
    "vcpu" INTEGER NOT NULL,
    "instance_storage" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aws_instance_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocks" (
    "block_number" BIGINT NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,
    "gas_used" BIGINT NOT NULL,
    "transaction_count" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocks_pkey" PRIMARY KEY ("block_number")
);

-- CreateTable
CREATE TABLE "cluster_configurations" (
    "id" BIGSERIAL NOT NULL,
    "cluster_id" UUID NOT NULL,
    "instance_type_id" BIGINT NOT NULL,
    "instance_count" INTEGER NOT NULL,

    CONSTRAINT "cluster_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clusters" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "index" INTEGER,
    "nickname" TEXT NOT NULL,
    "team_id" UUID NOT NULL,
    "description" TEXT,
    "hardware" TEXT,
    "cycle_type" TEXT,
    "proof_type" TEXT,

    CONSTRAINT "clusters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" BIGSERIAL NOT NULL,
    "verifier_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proofs" (
    "proof_id" SERIAL NOT NULL,
    "block_number" BIGINT NOT NULL,
    "proof" BYTEA,
    "proof_status" TEXT NOT NULL,
    "proving_cycles" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proved_timestamp" TIMESTAMPTZ(6),
    "proving_timestamp" TIMESTAMPTZ(6),
    "queued_timestamp" TIMESTAMPTZ(6),
    "proving_time" INTEGER NOT NULL,
    "team_id" UUID NOT NULL,
    "cluster_id" UUID NOT NULL,
    "program_id" BIGINT,

    CONSTRAINT "proofs_pkey" PRIMARY KEY ("proof_id")
);

-- CreateTable
CREATE TABLE "recursive_root_proofs" (
    "root_proof_id" SERIAL NOT NULL,
    "block_number" BIGINT,
    "root_proof" BYTEA NOT NULL,
    "root_proof_size" BIGINT NOT NULL,
    "total_proof_size" BIGINT NOT NULL,
    "team_id" UUID NOT NULL,

    CONSTRAINT "recursive_root_proofs_pkey" PRIMARY KEY ("root_proof_id")
);

-- CreateTable
CREATE TABLE "teams" (
    "team_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "team_name" TEXT NOT NULL,
    "github_org" TEXT,
    "logo_url" TEXT,
    "twitter_handle" TEXT,
    "website_url" TEXT,
    "user_id" UUID NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("team_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "api_auth_tokens_token_key" ON "api_auth_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "programs_verifier_id_key" ON "programs"("verifier_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_block_cluster" ON "proofs"("block_number", "cluster_id");

-- AddForeignKey
ALTER TABLE "api_auth_tokens" ADD CONSTRAINT "api_auth_tokens_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("team_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cluster_configurations" ADD CONSTRAINT "cluster_configurations_cluster_id_fkey" FOREIGN KEY ("cluster_id") REFERENCES "clusters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cluster_configurations" ADD CONSTRAINT "cluster_configurations_instance_type_id_fkey" FOREIGN KEY ("instance_type_id") REFERENCES "aws_instance_pricing"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clusters" ADD CONSTRAINT "clusters_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("team_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "proofs" ADD CONSTRAINT "proofs_block_number_fkey" FOREIGN KEY ("block_number") REFERENCES "blocks"("block_number") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "proofs" ADD CONSTRAINT "proofs_cluster_id_fkey" FOREIGN KEY ("cluster_id") REFERENCES "clusters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "proofs" ADD CONSTRAINT "proofs_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "proofs" ADD CONSTRAINT "proofs_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("team_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "recursive_root_proofs" ADD CONSTRAINT "recursive_root_proofs_block_number_fkey" FOREIGN KEY ("block_number") REFERENCES "blocks"("block_number") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "recursive_root_proofs" ADD CONSTRAINT "recursive_root_proofs_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("team_id") ON DELETE NO ACTION ON UPDATE NO ACTION;



-- VIEWS

create or replace view "public"."recent_summary" with (security_invoker=on) as
  select 
    count(distinct "b"."block_number") as "total_proven_blocks",
    coalesce(avg((("cc"."instance_count" * "a"."hourly_price") * "p"."proving_time") / (1000.0 * 60 * 60)), 0::numeric) as "avg_cost_per_proof",
    coalesce(avg("p"."proving_time"), 0::numeric) as "avg_proving_time"
  from "public"."blocks" "b"
  join "public"."proofs" "p" on "b"."block_number" = "p"."block_number" and "p"."proof_status" = 'proved'
  join "public"."cluster_configurations" "cc" on "p"."cluster_id" = "cc"."cluster_id"
  join "public"."aws_instance_pricing" "a" on "cc"."instance_type_id" = "a"."id"
  where "b"."timestamp" >= (now() - '30 days'::interval);

create or replace view "public"."teams_summary" with (security_invoker=on) as
  select "t"."team_id",
         "t"."team_name",
         "t"."logo_url",
         coalesce(sum(cc."instance_count" * a."hourly_price" * (p."proving_time" / (1000.0 * 60 * 60))) / nullif(count(p."proof_id"), 0), 0) as "avg_cost_per_proof",
         avg("p"."proving_time") as "avg_proving_time"
  from "public"."teams" "t"
  left join "public"."proofs" "p" on "t"."team_id" = "p"."team_id" 
                          and "p"."proof_status" = 'proved' 
  left join "public"."cluster_configurations" "cc" on "p"."cluster_id" = "cc"."cluster_id"
  left join "public"."aws_instance_pricing" "a" on "cc"."instance_type_id" = "a"."id"
  group by "t"."team_id";

-- FUNCTIONS

-- https://supabase.com/docs/guides/auth/managing-user-data
-- inserts a row into public.teams
create function "public".handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.teams (team_id, team_name)
  values (new.id, 'default');
  return new;
end;
$$;

-- generates a cluster_id for a new user
CREATE OR REPLACE FUNCTION "public"."generate_cluster_index"() RETURNS "trigger"
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

CREATE OR REPLACE TRIGGER "set_cluster_index" BEFORE INSERT ON "public"."clusters" FOR EACH ROW EXECUTE FUNCTION "public"."generate_cluster_index"();

-- TRIGGERS

-- trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
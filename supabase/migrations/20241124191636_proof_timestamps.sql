alter table "public"."proofs" drop column if exists "submission_time";

alter table "public"."proofs" add column "created_at" timestamp with time zone default now();

alter table "public"."proofs" add column "proved_timestamp" timestamp with time zone;

alter table "public"."proofs" add column "proving_timestamp" timestamp with time zone;

alter table "public"."proofs" add column "queued_timestamp" timestamp with time zone;

alter table "public"."proofs" add column "proof_latency" integer;
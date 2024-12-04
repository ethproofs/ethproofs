alter table "public"."proofs" drop column "prover_duration";

alter table "public"."proofs" add column "proving_time" integer;

drop view if exists "public"."recent_summary";

drop view if exists "public"."teams_summary";

alter table "public"."proofs"
  drop column "prover_duration",
  drop column "proof_latency",
  add column "proving_time" integer;

create or replace view "public"."recent_summary" as
  select count(distinct "b"."block_number") as "total_proven_blocks",  
    coalesce("avg"("p"."proving_cost"), (0)::numeric) as "avg_cost_per_proof",  
    coalesce("avg"("p"."proving_time"), (0)::numeric) as "avg_proving_time"  
  from ("public"."blocks" "b"  
  join "public"."proofs" "p" on (("b"."block_number" = "p"."block_number")))  
  where ("b"."timestamp" >= ("now"() - '30 days'::interval));  

create or replace view "public"."teams_summary" as
  select "t"."team_id",
    "t"."team_name",
    "t"."logo_url",
    "avg"("p"."proving_cost") AS "avg_proving_cost",
    "avg"("p"."proving_time") AS "avg_proving_time"
  from ("public"."teams" "t"
    left join "public"."proofs" "p" on (("t"."user_id" = "p"."user_id")))
  where (("p"."proof_status" = 'proved'::"text") and
    ("p"."proved_timestamp" >= ("now"() - '30 days'::interval)))
  group by "t"."team_id";

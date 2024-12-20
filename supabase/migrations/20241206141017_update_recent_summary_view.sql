drop view if exists "public"."recent_summary";

create or replace view "public"."recent_summary" as
  select 
    count(distinct "b"."block_number") as "total_proven_blocks",
    coalesce(avg(("a"."hourly_price" * "p"."proving_time") / (1000 * 60 * 60)), 0::numeric) as "avg_cost_per_proof",
    coalesce(avg("p"."proving_time"), 0::numeric) as "avg_proving_time"
  from "public"."blocks" "b"
  join "public"."proofs" "p" on "b"."block_number" = "p"."block_number" and "p"."proof_status" = 'proved'
  join "public"."cluster_configurations" "cc" on "p"."cluster_id" = "cc"."cluster_id"
  join "public"."aws_instance_pricing" "a" on "cc"."instance_type_id" = "a"."id"
  where "b"."timestamp" >= (now() - '30 days'::interval);

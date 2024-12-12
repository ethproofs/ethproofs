alter table "public"."proofs" drop column "proving_cost";

drop view if exists "public"."recent_summary";

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

drop view if exists "public"."teams_summary";

create or replace view "public"."teams_summary" with (security_invoker=on) as
  SELECT "t"."team_id",
         "t"."team_name",
         "t"."logo_url",
         COALESCE(SUM(cc."instance_count" * a."hourly_price" * (p."proving_time" / (1000.0 * 60 * 60))) / NULLIF(COUNT(p."proof_id"), 0), 0) AS "avg_cost_per_proof",
         AVG("p"."proving_time") AS "avg_proving_time"
  FROM "public"."teams" "t"
  LEFT JOIN "public"."proofs" "p" ON "t"."user_id" = "p"."user_id" 
                          AND "p"."proof_status" = 'proved' 
  LEFT JOIN "public"."cluster_configurations" "cc" ON "p"."cluster_id" = "cc"."cluster_id"
  LEFT JOIN "public"."aws_instance_pricing" "a" ON "cc"."instance_type_id" = "a"."id"
  GROUP BY "t"."team_id";
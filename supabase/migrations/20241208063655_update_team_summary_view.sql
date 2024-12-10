drop view if exists "public"."team_summary";

create or replace view "public"."teams_summary" as
  select "t"."team_id",
    "t"."team_name",
    "t"."logo_url",
    "avg"(
      cast(("a"."hourly_price" * "p"."proving_time") / (1000 * 60 * 60) as numeric)
    ) as "avg_proving_cost",
    "avg"("p"."proving_time") as "avg_proving_time"
  from "teams" t
    left join "proofs" p on "t"."user_id" = "p"."user_id" and "p"."proof_status" = 'proved' and "p"."proved_timestamp" >= now() - interval '30 days'
    left join "cluster_configurations" cc on "p"."cluster_id" = cc."cluster_id"
    left join "aws_instance_pricing" a on cc."instance_type_id" = "a"."id"
  group by "t"."team_id";

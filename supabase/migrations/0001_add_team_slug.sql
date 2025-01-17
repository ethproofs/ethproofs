DROP VIEW "public"."teams_summary";--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "slug" text NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_slug_unique" UNIQUE("slug");--> statement-breakpoint

-- populate the slug column
UPDATE "teams" SET "slug" = replace(lower("name"), ' ', '_');

-- make the slug column not nullable
ALTER TABLE "teams" ALTER COLUMN "slug" SET NOT NULL;

CREATE VIEW "public"."teams_summary" WITH (security_invoker = true) AS (
    SELECT t.id as team_id,
      t.name as team_name,
      t.logo_url,
      t.slug,
      COALESCE(sum(cc.instance_count::double precision * a.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) / NULLIF(count(p.proof_id), 0)::double precision, 0::double precision) AS avg_cost_per_proof,
      avg(p.proving_time) AS avg_proving_time
    FROM teams t 
    LEFT JOIN proofs p ON t.id = p.team_id AND p.proof_status = 'proved'::text 
    LEFT JOIN cluster_configurations cc ON p.cluster_id = cc.cluster_id 
    LEFT JOIN aws_instance_pricing a ON cc.instance_type_id = a.id 
    GROUP BY t.id);
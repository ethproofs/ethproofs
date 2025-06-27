DROP VIEW "public"."teams_summary";--> statement-breakpoint
ALTER TABLE "zkvms" ADD COLUMN "dual_licenses" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "zkvms" ADD COLUMN "is_open_source" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "zkvms" ADD COLUMN "is_proving_mainnet" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE VIEW "public"."teams_summary" WITH (security_invoker = true) AS (
    SELECT t.id as team_id,
      t.name as team_name,
      t.logo_url,
      -- All proofs
      COALESCE(sum(cm.cloud_instance_count::double precision * ci.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) / NULLIF(count(p.proof_id), 0)::double precision, 0::double precision) AS avg_cost_per_proof,
      COALESCE(avg(p.proving_time), 0::numeric) AS avg_proving_time,
      count(p.proof_id) AS total_proofs,
      -- Multi-machine proofs
      COALESCE(sum(CASE WHEN c.is_multi_machine THEN (cm.cloud_instance_count::double precision * ci.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) ELSE 0 END) / NULLIF(sum(CASE WHEN c.is_multi_machine THEN 1 ELSE 0 END), 0)::double precision, 0::double precision) AS avg_cost_per_proof_multi,
      COALESCE(avg(CASE WHEN c.is_multi_machine THEN p.proving_time ELSE NULL END), 0::numeric) AS avg_proving_time_multi,
      sum(CASE WHEN c.is_multi_machine THEN 1 ELSE 0 END) AS total_proofs_multi,
      -- Single-machine proofs
      COALESCE(sum(CASE WHEN NOT c.is_multi_machine THEN (cm.cloud_instance_count::double precision * ci.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) ELSE 0 END) / NULLIF(sum(CASE WHEN NOT c.is_multi_machine THEN 1 ELSE 0 END), 0)::double precision, 0::double precision) AS avg_cost_per_proof_single,
      COALESCE(avg(CASE WHEN NOT c.is_multi_machine THEN p.proving_time ELSE NULL END), 0::numeric) AS avg_proving_time_single,
      sum(CASE WHEN NOT c.is_multi_machine THEN 1 ELSE 0 END) AS total_proofs_single
    FROM teams t
    LEFT JOIN proofs p ON t.id = p.team_id AND p.proof_status = 'proved'::text
    LEFT JOIN cluster_versions cv ON p.cluster_version_id = cv.id
    LEFT JOIN clusters c ON cv.cluster_id = c.id
    LEFT JOIN cluster_machines cm ON cv.id = cm.cluster_version_id
    LEFT JOIN cloud_instances ci ON cm.cloud_instance_id = ci.id
    GROUP BY t.id);
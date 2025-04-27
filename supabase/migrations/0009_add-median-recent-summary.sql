DROP VIEW "public"."recent_summary";--> statement-breakpoint
CREATE VIEW "public"."recent_summary" WITH (security_invoker = true) AS (
    SELECT count(DISTINCT b.block_number) AS total_proven_blocks,
      -- Calculate average cost per proof
      COALESCE(avg(cm.cloud_instance_count::double precision * ci.hourly_price * p.proving_time::double precision / (1000.0 * 60::numeric * 60::numeric)::double precision), 0::numeric::double precision) AS avg_cost_per_proof,
      -- Calculate median cost per proof
      COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY cm.cloud_instance_count::double precision * ci.hourly_price * p.proving_time::double precision / (1000.0 * 60::numeric * 60::numeric)::double precision), 0::numeric::double precision) AS median_cost_per_proof,
      -- Calculate average latency
      COALESCE(avg(p.proving_time), 0::numeric) AS avg_proving_time,
      -- Calculate median latency
      COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.proving_time), 0::numeric) AS median_proving_time
    FROM blocks b
    INNER JOIN proofs p ON b.block_number = p.block_number AND p.proof_status = 'proved'::text
    INNER JOIN cluster_versions cv ON p.cluster_version_id = cv.id
    INNER JOIN cluster_machines cm ON cv.id = cm.cluster_version_id
    INNER JOIN cloud_instances ci ON cm.cloud_instance_id = ci.id
    WHERE b."timestamp" >= (now() - '30 days'::interval));
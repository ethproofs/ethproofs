CREATE VIEW "public"."cluster_summary" WITH (security_invoker = true) AS (
    SELECT c.id as cluster_id,
      c.nickname as cluster_nickname,
      c.team_id,
      COALESCE(sum(cm.cloud_instance_count::double precision * ci.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) / NULLIF(count(p.proof_id), 0)::double precision, 0::double precision) AS avg_cost_per_proof,
      avg(p.proving_time) AS avg_proving_time
    FROM clusters c
    LEFT JOIN cluster_versions cv ON c.id = cv.cluster_id
    LEFT JOIN proofs p ON cv.id = p.cluster_version_id AND p.proof_status = 'proved'::text
    LEFT JOIN cluster_machines cm ON cv.id = cm.cluster_version_id
    LEFT JOIN cloud_instances ci ON cm.cloud_instance_id = ci.id
    GROUP BY c.id);
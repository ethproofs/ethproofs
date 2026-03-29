CREATE OR REPLACE VIEW recent_summary WITH (security_invoker = true) AS
SELECT count(DISTINCT b.block_number) AS total_proven_blocks,
  COALESCE(avg(c.num_gpus::double precision * gpi.hourly_price * p.proving_time::double precision / (1000.0 * 60::numeric * 60::numeric)::double precision), 0::numeric::double precision) AS avg_cost_per_proof,
  COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY c.num_gpus::double precision * gpi.hourly_price * p.proving_time::double precision / (1000.0 * 60::numeric * 60::numeric)::double precision), 0::numeric::double precision) AS median_cost_per_proof,
  COALESCE(avg(p.proving_time), 0::numeric) AS avg_proving_time,
  COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.proving_time), 0::numeric) AS median_proving_time
FROM blocks b
INNER JOIN proofs p ON b.block_number = p.block_number AND p.proof_status = 'proved'::text
INNER JOIN cluster_versions cv ON p.cluster_version_id = cv.id
INNER JOIN clusters c ON cv.cluster_id = c.id
LEFT JOIN gpu_price_index gpi ON p.gpu_price_index_id = gpi.id
WHERE b."timestamp" >= (now() - '30 days'::interval)
  AND NOT is_downtime_block(b.block_number);

CREATE OR REPLACE VIEW teams_summary WITH (security_invoker = true) AS
SELECT t.id as team_id,
  t.name as team_name,
  t.logo_url,
  COALESCE(sum(c.num_gpus::double precision * gpi.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) / NULLIF(count(p.proof_id), 0)::double precision, 0::double precision) AS avg_cost_per_proof,
  COALESCE(avg(p.proving_time), 0::numeric) AS avg_proving_time,
  count(p.proof_id) AS total_proofs,
  COALESCE(sum(CASE WHEN pt.gpu_configuration = 'multi-gpu' THEN (c.num_gpus::double precision * gpi.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) ELSE 0 END) / NULLIF(sum(CASE WHEN pt.gpu_configuration = 'multi-gpu' THEN 1 ELSE 0 END), 0)::double precision, 0::double precision) AS avg_cost_per_proof_multi,
  COALESCE(avg(CASE WHEN pt.gpu_configuration = 'multi-gpu' THEN p.proving_time ELSE NULL END), 0::numeric) AS avg_proving_time_multi,
  sum(CASE WHEN pt.gpu_configuration = 'multi-gpu' THEN 1 ELSE 0 END) AS total_proofs_multi,
  COALESCE(sum(CASE WHEN pt.gpu_configuration = 'single-gpu' THEN (c.num_gpus::double precision * gpi.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) ELSE 0 END) / NULLIF(sum(CASE WHEN pt.gpu_configuration = 'single-gpu' THEN 1 ELSE 0 END), 0)::double precision, 0::double precision) AS avg_cost_per_proof_single,
  COALESCE(avg(CASE WHEN pt.gpu_configuration = 'single-gpu' THEN p.proving_time ELSE NULL END), 0::numeric) AS avg_proving_time_single,
  sum(CASE WHEN pt.gpu_configuration = 'single-gpu' THEN 1 ELSE 0 END) AS total_proofs_single
FROM teams t
LEFT JOIN proofs p ON t.id = p.team_id AND p.proof_status = 'proved'::text AND NOT is_downtime_block(p.block_number)
LEFT JOIN cluster_versions cv ON p.cluster_version_id = cv.id
LEFT JOIN clusters c ON cv.cluster_id = c.id
LEFT JOIN prover_types pt ON c.prover_type_id = pt.id
LEFT JOIN gpu_price_index gpi ON p.gpu_price_index_id = gpi.id
GROUP BY t.id;

CREATE OR REPLACE VIEW cluster_summary WITH (security_invoker = true) AS
SELECT c.id as cluster_id,
  c.name as cluster_name,
  c.team_id,
  COALESCE(sum(c.num_gpus::double precision * gpi.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) / NULLIF(count(p.proof_id), 0)::double precision, 0::double precision) AS avg_cost_per_proof,
  avg(p.proving_time) AS avg_proving_time
FROM clusters c
LEFT JOIN cluster_versions cv ON c.id = cv.cluster_id
LEFT JOIN proofs p ON cv.id = p.cluster_version_id AND p.proof_status = 'proved'::text AND NOT is_downtime_block(p.block_number)
LEFT JOIN gpu_price_index gpi ON p.gpu_price_index_id = gpi.id
GROUP BY c.id;

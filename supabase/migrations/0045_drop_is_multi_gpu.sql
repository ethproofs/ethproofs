-- Drop is_multi_gpu column and update views to use prover_types instead
-- Since prover_types.gpu_configuration is now the source of truth

-- Step 1: Drop views that depend on is_multi_gpu
DROP VIEW IF EXISTS teams_summary CASCADE;

-- Step 2: Drop the is_multi_gpu column from clusters
ALTER TABLE clusters DROP COLUMN is_multi_gpu;

-- Step 3: Recreate teams_summary view using prover_types.gpu_configuration
CREATE VIEW teams_summary
WITH (security_invoker=true)
AS
SELECT t.id as team_id,
  t.name as team_name,
  t.logo_url,
  -- All proofs
  COALESCE(sum(c.num_gpus::double precision * gpi.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) / NULLIF(count(p.proof_id), 0)::double precision, 0::double precision) AS avg_cost_per_proof,
  COALESCE(avg(p.proving_time), 0::numeric) AS avg_proving_time,
  count(p.proof_id) AS total_proofs,
  -- Multi-GPU proofs (using prover_types.gpu_configuration)
  COALESCE(sum(CASE WHEN pt.gpu_configuration = 'multi-gpu' THEN (c.num_gpus::double precision * gpi.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) ELSE 0 END) / NULLIF(sum(CASE WHEN pt.gpu_configuration = 'multi-gpu' THEN 1 ELSE 0 END), 0)::double precision, 0::double precision) AS avg_cost_per_proof_multi,
  COALESCE(avg(CASE WHEN pt.gpu_configuration = 'multi-gpu' THEN p.proving_time ELSE NULL END), 0::numeric) AS avg_proving_time_multi,
  sum(CASE WHEN pt.gpu_configuration = 'multi-gpu' THEN 1 ELSE 0 END) AS total_proofs_multi,
  -- Single-GPU proofs (using prover_types.gpu_configuration)
  COALESCE(sum(CASE WHEN pt.gpu_configuration = 'single-gpu' THEN (c.num_gpus::double precision * gpi.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) ELSE 0 END) / NULLIF(sum(CASE WHEN pt.gpu_configuration = 'single-gpu' THEN 1 ELSE 0 END), 0)::double precision, 0::double precision) AS avg_cost_per_proof_single,
  COALESCE(avg(CASE WHEN pt.gpu_configuration = 'single-gpu' THEN p.proving_time ELSE NULL END), 0::numeric) AS avg_proving_time_single,
  sum(CASE WHEN pt.gpu_configuration = 'single-gpu' THEN 1 ELSE 0 END) AS total_proofs_single
FROM teams t
LEFT JOIN proofs p ON t.id = p.team_id AND p.proof_status = 'proved'::text
LEFT JOIN cluster_versions cv ON p.cluster_version_id = cv.id
LEFT JOIN clusters c ON cv.cluster_id = c.id
LEFT JOIN prover_types pt ON c.prover_type_id = pt.id
LEFT JOIN gpu_price_index gpi ON p.gpu_price_index_id = gpi.id
GROUP BY t.id;

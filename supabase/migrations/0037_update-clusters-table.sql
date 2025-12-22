-- Drop views that depend on clusters table
DROP VIEW IF EXISTS cluster_summary;
DROP VIEW IF EXISTS teams_summary;

-- Rename columns
ALTER TABLE clusters RENAME COLUMN nickname TO name;
ALTER TABLE clusters RENAME COLUMN is_multi_machine TO is_multi_gpu;

-- Add new column with default value
ALTER TABLE clusters ADD COLUMN num_gpus INTEGER NOT NULL DEFAULT 1;

-- Drop columns that are no longer needed
ALTER TABLE clusters DROP COLUMN cycle_type;
ALTER TABLE clusters DROP COLUMN proof_type;
ALTER TABLE clusters DROP COLUMN description;

-- Reset hardware field to NULL for all clusters
UPDATE clusters SET hardware = NULL;

-- Recreate cluster_summary view with updated column names
CREATE VIEW cluster_summary
WITH (security_invoker=true)
AS
SELECT c.id as cluster_id,
  c.name as cluster_name,
  c.team_id,
  COALESCE(sum(cm.cloud_instance_count::double precision * ci.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) / NULLIF(count(p.proof_id), 0)::double precision, 0::double precision) AS avg_cost_per_proof,
  avg(p.proving_time) AS avg_proving_time
FROM clusters c
LEFT JOIN cluster_versions cv ON c.id = cv.cluster_id
LEFT JOIN proofs p ON cv.id = p.cluster_version_id AND p.proof_status = 'proved'::text
LEFT JOIN cluster_machines cm ON cv.id = cm.cluster_version_id
LEFT JOIN cloud_instances ci ON cm.cloud_instance_id = ci.id
GROUP BY c.id;

-- Recreate teams_summary view with updated column names
CREATE VIEW teams_summary
WITH (security_invoker=true)
AS
SELECT t.id as team_id,
  t.name as team_name,
  t.logo_url,
  -- All proofs
  COALESCE(sum(cm.cloud_instance_count::double precision * ci.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) / NULLIF(count(p.proof_id), 0)::double precision, 0::double precision) AS avg_cost_per_proof,
  COALESCE(avg(p.proving_time), 0::numeric) AS avg_proving_time,
  count(p.proof_id) AS total_proofs,
  -- Multi-GPU proofs
  COALESCE(sum(CASE WHEN c.is_multi_gpu THEN (cm.cloud_instance_count::double precision * ci.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) ELSE 0 END) / NULLIF(sum(CASE WHEN c.is_multi_gpu THEN 1 ELSE 0 END), 0)::double precision, 0::double precision) AS avg_cost_per_proof_multi,
  COALESCE(avg(CASE WHEN c.is_multi_gpu THEN p.proving_time ELSE NULL END), 0::numeric) AS avg_proving_time_multi,
  sum(CASE WHEN c.is_multi_gpu THEN 1 ELSE 0 END) AS total_proofs_multi,
  -- Single-GPU proofs
  COALESCE(sum(CASE WHEN NOT c.is_multi_gpu THEN (cm.cloud_instance_count::double precision * ci.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) ELSE 0 END) / NULLIF(sum(CASE WHEN NOT c.is_multi_gpu THEN 1 ELSE 0 END), 0)::double precision, 0::double precision) AS avg_cost_per_proof_single,
  COALESCE(avg(CASE WHEN NOT c.is_multi_gpu THEN p.proving_time ELSE NULL END), 0::numeric) AS avg_proving_time_single,
  sum(CASE WHEN NOT c.is_multi_gpu THEN 1 ELSE 0 END) AS total_proofs_single
FROM teams t
LEFT JOIN proofs p ON t.id = p.team_id AND p.proof_status = 'proved'::text
LEFT JOIN cluster_versions cv ON p.cluster_version_id = cv.id
LEFT JOIN clusters c ON cv.cluster_id = c.id
LEFT JOIN cluster_machines cm ON cv.id = cm.cluster_version_id
LEFT JOIN cloud_instances ci ON cm.cloud_instance_id = ci.id
GROUP BY t.id;

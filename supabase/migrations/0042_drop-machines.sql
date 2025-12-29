-- Migrate num_gpus and drop machine/cloud tables
-- This migration:
-- 1. Calculates num_gpus from cluster_machines (machine_count * gpu_count[1])
-- 2. Adds gpu_price_index_id to proofs table and backfills it
-- 3. Drops views that depend on cluster_machines/cloud_instances
-- 4. Drops the four tables: cluster_machines, machines, cloud_instances, cloud_providers
-- 5. Recreates views using proofs.gpu_price_index_id instead of latest price

-- Step 1: Update num_gpus for all clusters based on their active cluster_version
UPDATE clusters c
SET num_gpus = (
  SELECT COALESCE(SUM(cm.machine_count * m.gpu_count[1]), 1)
  FROM cluster_versions cv
  INNER JOIN cluster_machines cm ON cm.cluster_version_id = cv.id
  INNER JOIN machines m ON m.id = cm.machine_id
  WHERE cv.cluster_id = c.id
    AND cv.is_active = true
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1 FROM cluster_versions cv
  WHERE cv.cluster_id = c.id AND cv.is_active = true
);

-- Step 2: Add gpu_price_index_id to proofs table
ALTER TABLE proofs ADD COLUMN gpu_price_index_id BIGINT REFERENCES gpu_price_index(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 3: Backfill gpu_price_index_id for existing proofs
-- For each proof, find the gpu_price_index entry that was active at the time of proving
-- Fallback to id=1 (oldest price entry) if no matching price index found
UPDATE proofs p
SET gpu_price_index_id = COALESCE(
  (
    SELECT gpi.id
    FROM gpu_price_index gpi
    WHERE gpi.created_at <= COALESCE(p.proved_timestamp, p.created_at)
    ORDER BY gpi.created_at DESC
    LIMIT 1
  ),
  1 -- Fallback to first price index entry for historical proofs
)
WHERE p.proof_status = 'proved';

-- Step 4: Drop views that depend on the tables we're removing
DROP VIEW IF EXISTS recent_summary CASCADE;
DROP VIEW IF EXISTS teams_summary CASCADE;
DROP VIEW IF EXISTS cluster_summary CASCADE;

-- Step 5: Drop tables in correct order (foreign key dependencies)
DROP TABLE IF EXISTS cluster_machines CASCADE;
DROP TABLE IF EXISTS machines CASCADE;
DROP TABLE IF EXISTS cloud_instances CASCADE;
DROP TABLE IF EXISTS cloud_providers CASCADE;

-- Step 6: Recreate recent_summary view using snapshot gpu_price_index_id
CREATE VIEW recent_summary
WITH (security_invoker=true)
AS
SELECT count(DISTINCT b.block_number) AS total_proven_blocks,
  -- Calculate average cost per proof using gpu_price_index snapshot
  COALESCE(avg(c.num_gpus::double precision * gpi.hourly_price * p.proving_time::double precision / (1000.0 * 60::numeric * 60::numeric)::double precision), 0::numeric::double precision) AS avg_cost_per_proof,
  -- Calculate median cost per proof
  COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY c.num_gpus::double precision * gpi.hourly_price * p.proving_time::double precision / (1000.0 * 60::numeric * 60::numeric)::double precision), 0::numeric::double precision) AS median_cost_per_proof,
  -- Calculate average latency
  COALESCE(avg(p.proving_time), 0::numeric) AS avg_proving_time,
  -- Calculate median latency
  COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.proving_time), 0::numeric) AS median_proving_time
FROM blocks b
INNER JOIN proofs p ON b.block_number = p.block_number AND p.proof_status = 'proved'::text
INNER JOIN cluster_versions cv ON p.cluster_version_id = cv.id
INNER JOIN clusters c ON cv.cluster_id = c.id
LEFT JOIN gpu_price_index gpi ON p.gpu_price_index_id = gpi.id
WHERE b."timestamp" >= (now() - '30 days'::interval);

-- Step 7: Recreate teams_summary view using snapshot gpu_price_index_id
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
  -- Multi-GPU proofs
  COALESCE(sum(CASE WHEN c.is_multi_gpu THEN (c.num_gpus::double precision * gpi.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) ELSE 0 END) / NULLIF(sum(CASE WHEN c.is_multi_gpu THEN 1 ELSE 0 END), 0)::double precision, 0::double precision) AS avg_cost_per_proof_multi,
  COALESCE(avg(CASE WHEN c.is_multi_gpu THEN p.proving_time ELSE NULL END), 0::numeric) AS avg_proving_time_multi,
  sum(CASE WHEN c.is_multi_gpu THEN 1 ELSE 0 END) AS total_proofs_multi,
  -- Single-GPU proofs
  COALESCE(sum(CASE WHEN NOT c.is_multi_gpu THEN (c.num_gpus::double precision * gpi.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) ELSE 0 END) / NULLIF(sum(CASE WHEN NOT c.is_multi_gpu THEN 1 ELSE 0 END), 0)::double precision, 0::double precision) AS avg_cost_per_proof_single,
  COALESCE(avg(CASE WHEN NOT c.is_multi_gpu THEN p.proving_time ELSE NULL END), 0::numeric) AS avg_proving_time_single,
  sum(CASE WHEN NOT c.is_multi_gpu THEN 1 ELSE 0 END) AS total_proofs_single
FROM teams t
LEFT JOIN proofs p ON t.id = p.team_id AND p.proof_status = 'proved'::text
LEFT JOIN cluster_versions cv ON p.cluster_version_id = cv.id
LEFT JOIN clusters c ON cv.cluster_id = c.id
LEFT JOIN gpu_price_index gpi ON p.gpu_price_index_id = gpi.id
GROUP BY t.id;

-- Step 8: Recreate cluster_summary view using snapshot gpu_price_index_id
CREATE VIEW cluster_summary
WITH (security_invoker=true)
AS
SELECT c.id as cluster_id,
  c.name as cluster_name,
  c.team_id,
  COALESCE(sum(c.num_gpus::double precision * gpi.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) / NULLIF(count(p.proof_id), 0)::double precision, 0::double precision) AS avg_cost_per_proof,
  avg(p.proving_time) AS avg_proving_time
FROM clusters c
LEFT JOIN cluster_versions cv ON c.id = cv.cluster_id
LEFT JOIN proofs p ON cv.id = p.cluster_version_id AND p.proof_status = 'proved'::text
LEFT JOIN gpu_price_index gpi ON p.gpu_price_index_id = gpi.id
GROUP BY c.id;

-- Step 9: Rename hardware column to hardware_description for clarity
ALTER TABLE clusters RENAME COLUMN hardware TO hardware_description;
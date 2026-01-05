-- Fix proofs_daily_stats triggers to use gpu_price_index instead of dropped tables
-- This migration updates the triggers that were broken when we dropped cluster_machines/cloud_instances

-- Drop existing triggers
DROP TRIGGER IF EXISTS trigger_update_proofs_daily_stats ON proofs;
DROP TRIGGER IF EXISTS trigger_update_prover_daily_stats ON proofs;

-- Update function to use gpu_price_index
CREATE OR REPLACE FUNCTION update_proofs_daily_stats()
RETURNS TRIGGER AS $$
DECLARE
  proof_date DATE;
BEGIN
  -- Get the date for the updated/inserted proof
  IF NEW.proved_timestamp IS NOT NULL THEN
    proof_date := DATE(NEW.proved_timestamp);
  ELSE
    RAISE EXCEPTION 'Proved timestamp is not available for proof %', NEW.proof_id;
  END IF;

  -- Create or update entry in proofs_daily_stats for this date
  INSERT INTO proofs_daily_stats (
    date,
    avg_cost,
    median_cost,
    avg_latency,
    median_latency,
    total_proofs
  )
  SELECT
    proof_date,
    -- Calculate average cost using gpu_price_index
    COALESCE(AVG(c.num_gpus::double precision * gpi.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision), 0),
    -- Calculate median cost
    COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY c.num_gpus::double precision * gpi.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision), 0),
    -- Calculate average latency
    COALESCE(AVG(p.proving_time)::integer, 0),
    -- Calculate median latency
    COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.proving_time)::integer, 0),
    -- Count total proofs for the day
    COUNT(p.proof_id)
  FROM
    proofs p
    JOIN cluster_versions cv ON p.cluster_version_id = cv.id
    JOIN clusters c ON cv.cluster_id = c.id
    LEFT JOIN gpu_price_index gpi ON p.gpu_price_index_id = gpi.id
  WHERE
    p.proof_status = 'proved'
    AND DATE(p.proved_timestamp) = proof_date
  GROUP BY
    DATE(p.proved_timestamp)
  ON CONFLICT (date) DO UPDATE SET
    avg_cost = EXCLUDED.avg_cost,
    median_cost = EXCLUDED.median_cost,
    avg_latency = EXCLUDED.avg_latency,
    median_latency = EXCLUDED.median_latency,
    total_proofs = EXCLUDED.total_proofs;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update function to use gpu_price_index
CREATE OR REPLACE FUNCTION update_prover_daily_stats()
RETURNS TRIGGER AS $$
DECLARE
  proof_date DATE;
BEGIN
  -- Get the date for the updated/inserted proof
  IF NEW.proved_timestamp IS NOT NULL THEN
    proof_date := DATE(NEW.proved_timestamp);
  ELSE
    RAISE EXCEPTION 'Proved timestamp is not available for proof %', NEW.proof_id;
  END IF;

  -- Create or update entry in prover_daily_stats for this prover (team) and date
  INSERT INTO prover_daily_stats (
    date,
    team_id,
    avg_cost,
    median_cost,
    avg_latency,
    median_latency,
    total_proofs
  )
  SELECT
    proof_date,
    p.team_id,
    -- Calculate average cost using gpu_price_index
    COALESCE(AVG(c.num_gpus::double precision * gpi.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision), 0),
    -- Calculate median cost
    COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY c.num_gpus::double precision * gpi.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision), 0),
    -- Calculate average latency
    COALESCE(AVG(p.proving_time)::integer, 0),
    -- Calculate median latency
    COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.proving_time)::integer, 0),
    -- Count total proofs for the day/team
    COUNT(p.proof_id)
  FROM
    proofs p
    JOIN cluster_versions cv ON p.cluster_version_id = cv.id
    JOIN clusters c ON cv.cluster_id = c.id
    LEFT JOIN gpu_price_index gpi ON p.gpu_price_index_id = gpi.id
  WHERE
    p.proof_status = 'proved'
    AND DATE(p.proved_timestamp) = proof_date
    AND p.team_id = NEW.team_id
  GROUP BY
    DATE(p.proved_timestamp),
    p.team_id
  ON CONFLICT (date, team_id) DO UPDATE SET
    avg_cost = EXCLUDED.avg_cost,
    median_cost = EXCLUDED.median_cost,
    avg_latency = EXCLUDED.avg_latency,
    median_latency = EXCLUDED.median_latency,
    total_proofs = EXCLUDED.total_proofs;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate triggers
CREATE TRIGGER trigger_update_proofs_daily_stats
AFTER INSERT OR UPDATE OF proof_status
ON proofs
FOR EACH ROW
WHEN (NEW.proof_status = 'proved')
EXECUTE FUNCTION update_proofs_daily_stats();

CREATE TRIGGER trigger_update_prover_daily_stats
AFTER INSERT OR UPDATE OF proof_status
ON proofs
FOR EACH ROW
WHEN (NEW.proof_status = 'proved')
EXECUTE FUNCTION update_prover_daily_stats();

-- Backfill proofs_daily_stats with all historical data
TRUNCATE TABLE proofs_daily_stats;
INSERT INTO proofs_daily_stats (
  date,
  avg_cost,
  median_cost,
  avg_latency,
  median_latency,
  total_proofs
)
SELECT
  DATE(p.proved_timestamp) as date,
  COALESCE(AVG(c.num_gpus::double precision * gpi.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision), 0) as avg_cost,
  COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY c.num_gpus::double precision * gpi.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision), 0) as median_cost,
  COALESCE(AVG(p.proving_time)::integer, 0) as avg_latency,
  COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.proving_time)::integer, 0) as median_latency,
  COUNT(p.proof_id) as total_proofs
FROM
  proofs p
  JOIN cluster_versions cv ON p.cluster_version_id = cv.id
  JOIN clusters c ON cv.cluster_id = c.id
  LEFT JOIN gpu_price_index gpi ON p.gpu_price_index_id = gpi.id
WHERE
  p.proof_status = 'proved'
  AND p.proved_timestamp IS NOT NULL
GROUP BY
  DATE(p.proved_timestamp)
ORDER BY date;

-- Backfill prover_daily_stats with all historical data
TRUNCATE TABLE prover_daily_stats;
INSERT INTO prover_daily_stats (
  date,
  team_id,
  avg_cost,
  median_cost,
  avg_latency,
  median_latency,
  total_proofs
)
SELECT
  DATE(p.proved_timestamp) as date,
  p.team_id,
  COALESCE(AVG(c.num_gpus::double precision * gpi.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision), 0) as avg_cost,
  COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY c.num_gpus::double precision * gpi.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision), 0) as median_cost,
  COALESCE(AVG(p.proving_time)::integer, 0) as avg_latency,
  COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.proving_time)::integer, 0) as median_latency,
  COUNT(p.proof_id) as total_proofs
FROM
  proofs p
  JOIN cluster_versions cv ON p.cluster_version_id = cv.id
  JOIN clusters c ON cv.cluster_id = c.id
  LEFT JOIN gpu_price_index gpi ON p.gpu_price_index_id = gpi.id
WHERE
  p.proof_status = 'proved'
  AND p.proved_timestamp IS NOT NULL
GROUP BY
  DATE(p.proved_timestamp),
  p.team_id
ORDER BY date, team_id;

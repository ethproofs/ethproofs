CREATE OR REPLACE VIEW proofs_excluding_downtime
WITH (security_invoker = true) AS
SELECT p.*
FROM proofs p
WHERE NOT EXISTS (
  SELECT 1
  FROM downtime_incidents di
  WHERE p.block_number BETWEEN di.start_block AND di.end_block
);

CREATE OR REPLACE VIEW teams_summary
WITH (security_invoker = true) AS
SELECT t.id AS team_id,
  t.name AS team_name,
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
LEFT JOIN proofs_excluding_downtime p ON t.id = p.team_id AND p.proof_status = 'proved'::text
LEFT JOIN cluster_versions cv ON p.cluster_version_id = cv.id
LEFT JOIN clusters c ON cv.cluster_id = c.id
LEFT JOIN prover_types pt ON c.prover_type_id = pt.id
LEFT JOIN gpu_price_index gpi ON p.gpu_price_index_id = gpi.id
GROUP BY t.id;

DROP VIEW IF EXISTS cluster_summary;

CREATE MATERIALIZED VIEW cluster_summary AS
SELECT c.id AS cluster_id,
  c.name AS cluster_name,
  c.team_id,
  COALESCE(sum(c.num_gpus::double precision * gpi.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision) / NULLIF(count(p.proof_id), 0)::double precision, 0::double precision) AS avg_cost_per_proof,
  avg(p.proving_time) AS avg_proving_time
FROM clusters c
LEFT JOIN cluster_versions cv ON c.id = cv.cluster_id
LEFT JOIN proofs_excluding_downtime p ON cv.id = p.cluster_version_id AND p.proof_status = 'proved'::text
LEFT JOIN gpu_price_index gpi ON p.gpu_price_index_id = gpi.id
GROUP BY c.id;

CREATE UNIQUE INDEX cluster_summary_cluster_id_idx
  ON cluster_summary (cluster_id);

REVOKE ALL ON public.cluster_summary FROM anon, authenticated;

CREATE OR REPLACE FUNCTION refresh_cluster_summary()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY cluster_summary;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in refresh_cluster_summary: %', SQLERRM;
    RAISE;
END;
$$;

SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'refresh-cluster-summary';

SELECT cron.schedule(
  'refresh-cluster-summary',
  '2-59/5 * * * *',
  'SELECT refresh_cluster_summary();'
);

DROP MATERIALIZED VIEW IF EXISTS team_proof_stats;

CREATE MATERIALIZED VIEW team_proof_stats AS
SELECT
  p.team_id,
  count(p.proof_id)::int AS total_proofs,
  COALESCE(avg(p.proving_time), 0)::float AS avg_proving_time,
  count(CASE WHEN p.proving_time < 10000 THEN 1 END)::int AS sub_10s_proofs,
  count(CASE WHEN p.proving_time >= 10000 THEN 1 END)::int AS over_10s_proofs,
  COALESCE(
    sum(c.num_gpus::double precision * gpi.hourly_price * (p.proving_time::numeric / 3600000.0)::double precision)
    / NULLIF(count(CASE WHEN c.num_gpus IS NOT NULL AND gpi.hourly_price IS NOT NULL AND p.proving_time IS NOT NULL THEN p.proof_id END), 0)::double precision,
    0
  )::float AS avg_cost_per_proof
FROM proofs_excluding_downtime p
LEFT JOIN cluster_versions cv ON p.cluster_version_id = cv.id
LEFT JOIN clusters c ON cv.cluster_id = c.id
LEFT JOIN gpu_price_index gpi ON p.gpu_price_index_id = gpi.id
WHERE p.proof_status = 'proved'
GROUP BY p.team_id;

CREATE UNIQUE INDEX team_proof_stats_team_id_idx
  ON team_proof_stats (team_id);

REVOKE ALL ON public.team_proof_stats FROM anon, authenticated;

DROP MATERIALIZED VIEW IF EXISTS guest_diversity_weekly;

CREATE MATERIALIZED VIEW guest_diversity_weekly AS
SELECT
  gp.id AS guest_program_id,
  gp.name AS guest_name,
  date_trunc('week', b.timestamp::timestamptz) AS week,
  count(p.proof_id)::int AS proof_count
FROM proofs_excluding_downtime p
INNER JOIN blocks b ON p.block_number = b.block_number
INNER JOIN cluster_versions cv ON p.cluster_version_id = cv.id
INNER JOIN clusters c ON cv.cluster_id = c.id
INNER JOIN guest_programs gp ON c.guest_program_id = gp.id
WHERE p.proof_status = 'proved'
GROUP BY gp.id, gp.name, date_trunc('week', b.timestamp::timestamptz);

CREATE UNIQUE INDEX guest_diversity_weekly_unique_idx
  ON guest_diversity_weekly (guest_program_id, week);

CREATE INDEX guest_diversity_weekly_week_idx
  ON guest_diversity_weekly (week);

REVOKE ALL ON public.guest_diversity_weekly FROM anon, authenticated;

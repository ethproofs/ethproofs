SET LOCAL lock_timeout = '5s';

CREATE MATERIALIZED VIEW team_proof_stats_new AS
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

CREATE UNIQUE INDEX team_proof_stats_new_team_id_idx
  ON team_proof_stats_new (team_id);

CREATE MATERIALIZED VIEW guest_diversity_weekly_new AS
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

CREATE UNIQUE INDEX guest_diversity_weekly_new_unique_idx
  ON guest_diversity_weekly_new (guest_program_id, week);

CREATE INDEX guest_diversity_weekly_new_week_idx
  ON guest_diversity_weekly_new (week);

DROP MATERIALIZED VIEW IF EXISTS team_proof_stats;

ALTER MATERIALIZED VIEW team_proof_stats_new RENAME TO team_proof_stats;

ALTER INDEX team_proof_stats_new_team_id_idx RENAME TO team_proof_stats_team_id_idx;

DROP MATERIALIZED VIEW IF EXISTS guest_diversity_weekly;

ALTER MATERIALIZED VIEW guest_diversity_weekly_new RENAME TO guest_diversity_weekly;

ALTER INDEX guest_diversity_weekly_new_unique_idx RENAME TO guest_diversity_weekly_unique_idx;

ALTER INDEX guest_diversity_weekly_new_week_idx RENAME TO guest_diversity_weekly_week_idx;

REVOKE ALL ON public.team_proof_stats FROM anon, authenticated;

REVOKE ALL ON public.guest_diversity_weekly FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.refresh_team_proof_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.team_proof_stats;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in refresh_team_proof_stats: %', SQLERRM;
    RAISE;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.refresh_team_proof_stats() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.refresh_guest_diversity_weekly()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.guest_diversity_weekly;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in refresh_guest_diversity_weekly: %', SQLERRM;
    RAISE;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.refresh_guest_diversity_weekly() FROM PUBLIC, anon, authenticated;

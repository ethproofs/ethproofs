-- Materialized view backing fetchTeamsTableData.
-- The original CTE scanned the entire proofs table on every cache miss; this MV
-- precomputes the aggregates and is refreshed on a schedule so reads are O(N teams).

CREATE MATERIALIZED VIEW IF NOT EXISTS team_proof_stats AS
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
FROM proofs p
LEFT JOIN cluster_versions cv ON p.cluster_version_id = cv.id
LEFT JOIN clusters c ON cv.cluster_id = c.id
LEFT JOIN gpu_price_index gpi ON p.gpu_price_index_id = gpi.id
WHERE p.proof_status = 'proved'
  AND NOT is_downtime_block(p.block_number)
GROUP BY p.team_id;

-- Unique index required by REFRESH MATERIALIZED VIEW CONCURRENTLY.
CREATE UNIQUE INDEX IF NOT EXISTS team_proof_stats_team_id_idx
  ON team_proof_stats (team_id);

-- Materialized views in `public` are exposed via the Supabase REST/GraphQL API
-- to anon and authenticated roles by default, and Postgres does not enforce RLS
-- on materialized views. The app reads this MV via the postgres pooler role
-- (Drizzle), not the public API, so revoking from the API roles is safe.
REVOKE ALL ON public.team_proof_stats FROM anon, authenticated;

CREATE OR REPLACE FUNCTION refresh_team_proof_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY team_proof_stats;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in refresh_team_proof_stats: %', SQLERRM;
    RAISE;
END;
$$;

-- Schedule refresh every 5 minutes; matches the freshness the table needs.
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'refresh-team-proof-stats';

SELECT cron.schedule(
  'refresh-team-proof-stats',
  '*/5 * * * *',
  'SELECT refresh_team_proof_stats();'
);

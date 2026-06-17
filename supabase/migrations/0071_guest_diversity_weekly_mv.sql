-- Materialized view backing fetchGuestDiversityTrend.
-- The original query joined proofs to blocks/cluster_versions/clusters/guest_programs
-- and called is_downtime_block() per row across 6 months of proofs on every cache
-- miss, which exceeded the Netlify function timeout. This MV precomputes the weekly
-- aggregates so reads are O(weeks * guests).

CREATE MATERIALIZED VIEW IF NOT EXISTS guest_diversity_weekly AS
SELECT
  gp.id AS guest_program_id,
  gp.name AS guest_name,
  date_trunc('week', b.timestamp::timestamptz) AS week,
  count(p.proof_id)::int AS proof_count
FROM proofs p
INNER JOIN blocks b ON p.block_number = b.block_number
INNER JOIN cluster_versions cv ON p.cluster_version_id = cv.id
INNER JOIN clusters c ON cv.cluster_id = c.id
INNER JOIN guest_programs gp ON c.guest_program_id = gp.id
WHERE p.proof_status = 'proved'
  AND NOT is_downtime_block(b.block_number)
GROUP BY gp.id, gp.name, date_trunc('week', b.timestamp::timestamptz);

-- Unique index required by REFRESH MATERIALIZED VIEW CONCURRENTLY.
CREATE UNIQUE INDEX IF NOT EXISTS guest_diversity_weekly_unique_idx
  ON guest_diversity_weekly (guest_program_id, week);

-- Supports the read-side filter on `week`.
CREATE INDEX IF NOT EXISTS guest_diversity_weekly_week_idx
  ON guest_diversity_weekly (week);

-- Materialized views in `public` are exposed via the Supabase REST/GraphQL API
-- to anon and authenticated roles by default, and Postgres does not enforce RLS
-- on materialized views. The app reads this MV via the postgres pooler role
-- (Drizzle), not the public API, so revoking from the API roles is safe.
REVOKE ALL ON public.guest_diversity_weekly FROM anon, authenticated;

CREATE OR REPLACE FUNCTION refresh_guest_diversity_weekly()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY guest_diversity_weekly;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in refresh_guest_diversity_weekly: %', SQLERRM;
    RAISE;
END;
$$;

-- Refresh every 15 minutes; chart bucket is weekly, and this stays out of the
-- 5-minute team_proof_stats refresh window so they don't compete for I/O.
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'refresh-guest-diversity-weekly';

SELECT cron.schedule(
  'refresh-guest-diversity-weekly',
  '*/15 * * * *',
  'SELECT refresh_guest_diversity_weekly();'
);

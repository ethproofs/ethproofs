CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION snapshot_rtp_cohort()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  week_start timestamptz;
  window_days integer := 7;
  perf_threshold_ms integer := 10000;
  paralyzer_cutoff_minutes integer := 20;
  perf_score_threshold numeric := 75;
  liveness_score_threshold numeric := 75;
BEGIN
  week_start := date_trunc('week', NOW());

  RAISE LOG 'Starting RTP cohort snapshot for week %', week_start;

  INSERT INTO rtp_cohort_snapshots (
    cluster_id, snapshot_week,
    total_blocks, blocks_proven, sub_10s_proofs, over_10s_proofs, paralyzed_blocks,
    performance_score, liveness_score, stunner_rate, paralyzer_rate,
    is_eligible, avg_cost_per_proof
  )
  WITH window_blocks AS (
    SELECT block_number, "timestamp"
    FROM blocks
    WHERE "timestamp" >= NOW() - make_interval(days => window_days)
  ),
  total_block_count AS (
    SELECT COUNT(*)::integer AS cnt FROM window_blocks
  ),
  cluster_stats AS (
    SELECT
      p.cluster_id,
      COUNT(DISTINCT CASE
        WHEN p.proof_status = 'proved' AND p.proving_time < perf_threshold_ms
        THEN p.block_number
      END)::integer AS sub_10s_proofs,
      COUNT(DISTINCT CASE
        WHEN p.proof_status = 'proved'
        THEN p.block_number
      END)::integer AS blocks_proven,
      COUNT(DISTINCT CASE
        WHEN p.proof_status = 'proved' AND p.proving_time >= perf_threshold_ms
        THEN p.block_number
      END)::integer AS over_10s_proofs,
      COUNT(DISTINCT CASE
        WHEN p.proof_status IN ('queued', 'proving')
          AND wb."timestamp" < NOW() - make_interval(mins => paralyzer_cutoff_minutes)
        THEN p.block_number
      END)::integer AS paralyzed_blocks,
      COALESCE(
        SUM(
          CASE WHEN p.proof_status = 'proved' THEN
            c.num_gpus::double precision
            * gpi.hourly_price::double precision
            * p.proving_time::double precision
            / 3600000.0
          END
        ) / NULLIF(COUNT(CASE WHEN p.proof_status = 'proved' THEN 1 END), 0),
        NULL
      ) AS avg_cost_per_proof
    FROM proofs p
    INNER JOIN window_blocks wb ON p.block_number = wb.block_number
    INNER JOIN clusters c ON p.cluster_id = c.id
    LEFT JOIN gpu_price_index gpi ON p.gpu_price_index_id = gpi.id
    GROUP BY p.cluster_id
  )
  SELECT
    c.id,
    week_start,
    tbc.cnt,
    COALESCE(cs.blocks_proven, 0),
    COALESCE(cs.sub_10s_proofs, 0),
    COALESCE(cs.over_10s_proofs, 0),
    COALESCE(cs.paralyzed_blocks, 0),
    CASE WHEN tbc.cnt > 0
      THEN ROUND((COALESCE(cs.sub_10s_proofs, 0)::numeric / tbc.cnt * 100), 2)::double precision
      ELSE 0
    END,
    CASE WHEN tbc.cnt > 0
      THEN ROUND((COALESCE(cs.blocks_proven, 0)::numeric / tbc.cnt * 100), 2)::double precision
      ELSE 0
    END,
    CASE WHEN tbc.cnt > 0
      THEN ROUND((COALESCE(cs.over_10s_proofs, 0)::numeric / tbc.cnt * 100), 2)::double precision
      ELSE 0
    END,
    CASE WHEN tbc.cnt > 0
      THEN ROUND((COALESCE(cs.paralyzed_blocks, 0)::numeric / tbc.cnt * 100), 2)::double precision
      ELSE 0
    END,
    (
      COALESCE(zsm.soundcalc_integration, false) = true
      AND CASE WHEN tbc.cnt > 0
        THEN (COALESCE(cs.sub_10s_proofs, 0)::numeric / tbc.cnt * 100) >= perf_score_threshold
        ELSE false
      END
      AND CASE WHEN tbc.cnt > 0
        THEN (COALESCE(cs.blocks_proven, 0)::numeric / tbc.cnt * 100) >= liveness_score_threshold
        ELSE false
      END
    ),
    cs.avg_cost_per_proof
  FROM clusters c
  INNER JOIN prover_types pt ON c.prover_type_id = pt.id
  INNER JOIN LATERAL (
    SELECT cv_inner.zkvm_version_id
    FROM cluster_versions cv_inner
    WHERE cv_inner.cluster_id = c.id
    ORDER BY cv_inner.created_at DESC
    LIMIT 1
  ) cv ON true
  INNER JOIN zkvm_versions zv ON cv.zkvm_version_id = zv.id
  INNER JOIN zkvms z ON zv.zkvm_id = z.id
  LEFT JOIN zkvm_security_metrics zsm ON zsm.zkvm_id = z.id
  CROSS JOIN total_block_count tbc
  LEFT JOIN cluster_stats cs ON cs.cluster_id = c.id
  WHERE c.is_active = true
    AND pt.gpu_configuration = 'multi-gpu'
  ON CONFLICT (cluster_id, snapshot_week) DO UPDATE SET
    total_blocks = EXCLUDED.total_blocks,
    blocks_proven = EXCLUDED.blocks_proven,
    sub_10s_proofs = EXCLUDED.sub_10s_proofs,
    over_10s_proofs = EXCLUDED.over_10s_proofs,
    paralyzed_blocks = EXCLUDED.paralyzed_blocks,
    performance_score = EXCLUDED.performance_score,
    liveness_score = EXCLUDED.liveness_score,
    stunner_rate = EXCLUDED.stunner_rate,
    paralyzer_rate = EXCLUDED.paralyzer_rate,
    is_eligible = EXCLUDED.is_eligible,
    avg_cost_per_proof = EXCLUDED.avg_cost_per_proof;

  RAISE LOG 'RTP cohort snapshot completed for week %', week_start;

EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in snapshot_rtp_cohort: %', SQLERRM;
END;
$$;

SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'rtp-cohort-snapshot-weekly';

SELECT cron.schedule(
  'rtp-cohort-snapshot-weekly',
  '0 0 * * 1',
  'SELECT snapshot_rtp_cohort();'
);

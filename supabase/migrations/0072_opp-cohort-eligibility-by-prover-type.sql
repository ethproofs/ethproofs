CREATE OR REPLACE FUNCTION snapshot_opp_cohort()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  week_start timestamptz;
  window_days integer := 7;
  perf_threshold_ms integer := 120000;
  paralyzer_cutoff_minutes integer := 20;
  opp_prover_type_id integer := 5;
  opp_block_interval integer := 10;
BEGIN
  week_start := date_trunc('week', NOW());

  RAISE LOG 'Starting OPP cohort snapshot for week %', week_start;

  INSERT INTO opp_cohort_snapshots (
    cluster_id, snapshot_week,
    total_blocks, blocks_proven, sub_threshold_proofs, over_threshold_proofs, paralyzed_blocks,
    performance_score, liveness_score, stunner_rate, paralyzer_rate,
    is_eligible, avg_cost_per_proof
  )
  WITH window_blocks AS (
    SELECT block_number, "timestamp"
    FROM blocks
    WHERE "timestamp" >= NOW() - make_interval(days => window_days)
      AND NOT is_downtime_block(block_number)
      AND block_number % opp_block_interval = 0
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
      END)::integer AS sub_threshold_proofs,
      COUNT(DISTINCT CASE
        WHEN p.proof_status = 'proved'
        THEN p.block_number
      END)::integer AS blocks_proven,
      COUNT(DISTINCT CASE
        WHEN p.proof_status = 'proved' AND p.proving_time >= perf_threshold_ms
        THEN p.block_number
      END)::integer AS over_threshold_proofs,
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
    COALESCE(cs.sub_threshold_proofs, 0),
    COALESCE(cs.over_threshold_proofs, 0),
    COALESCE(cs.paralyzed_blocks, 0),
    CASE WHEN tbc.cnt > 0
      THEN ROUND((COALESCE(cs.sub_threshold_proofs, 0)::numeric / tbc.cnt * 100), 2)::double precision
      ELSE 0
    END,
    CASE WHEN tbc.cnt > 0
      THEN ROUND((COALESCE(cs.blocks_proven, 0)::numeric / tbc.cnt * 100), 2)::double precision
      ELSE 0
    END,
    CASE WHEN tbc.cnt > 0
      THEN ROUND((COALESCE(cs.over_threshold_proofs, 0)::numeric / tbc.cnt * 100), 2)::double precision
      ELSE 0
    END,
    CASE WHEN tbc.cnt > 0
      THEN ROUND((COALESCE(cs.paralyzed_blocks, 0)::numeric / tbc.cnt * 100), 2)::double precision
      ELSE 0
    END,
    true,
    cs.avg_cost_per_proof
  FROM clusters c
  CROSS JOIN total_block_count tbc
  LEFT JOIN cluster_stats cs ON cs.cluster_id = c.id
  WHERE c.is_active = true
    AND c.prover_type_id = opp_prover_type_id
  ON CONFLICT (cluster_id, snapshot_week) DO UPDATE SET
    total_blocks = EXCLUDED.total_blocks,
    blocks_proven = EXCLUDED.blocks_proven,
    sub_threshold_proofs = EXCLUDED.sub_threshold_proofs,
    over_threshold_proofs = EXCLUDED.over_threshold_proofs,
    paralyzed_blocks = EXCLUDED.paralyzed_blocks,
    performance_score = EXCLUDED.performance_score,
    liveness_score = EXCLUDED.liveness_score,
    stunner_rate = EXCLUDED.stunner_rate,
    paralyzer_rate = EXCLUDED.paralyzer_rate,
    is_eligible = EXCLUDED.is_eligible,
    avg_cost_per_proof = EXCLUDED.avg_cost_per_proof;

  RAISE LOG 'OPP cohort snapshot completed for week %', week_start;

EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in snapshot_opp_cohort: %', SQLERRM;
    RAISE;
END;
$$;

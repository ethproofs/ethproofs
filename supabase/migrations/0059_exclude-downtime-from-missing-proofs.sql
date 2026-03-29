CREATE OR REPLACE FUNCTION populate_missing_proofs_temp()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    missing_count INTEGER;
BEGIN
    PERFORM set_config('search_path', 'public, pg_temp', true);

    CREATE TEMP TABLE IF NOT EXISTS missing_proofs_temp (
        team_id UUID,
        team_name TEXT,
        cluster_id UUID,
        cluster_nickname TEXT,
        cluster_id_suffix TEXT,
        block_number BIGINT,
        prover_type_id SMALLINT,
        prover_type_name TEXT
    );

    DELETE FROM missing_proofs_temp;

    INSERT INTO missing_proofs_temp (
        team_id, team_name, cluster_id, cluster_nickname,
        cluster_id_suffix, block_number, prover_type_id, prover_type_name
    )
    SELECT
        c.team_id, c.team_name, c.id, c.name,
        RIGHT(c.id::text, 6), b.block_number,
        c.prover_type_id, c.prover_type_name
    FROM blocks b
    CROSS JOIN LATERAL (
        SELECT c.id, c.name, c.team_id, t.name as team_name,
               c.prover_type_id, pt.name as prover_type_name
        FROM clusters c
        JOIN teams t ON t.id = c.team_id
        JOIN prover_types pt ON pt.id = c.prover_type_id
        WHERE c.is_active = true
    ) c
    WHERE b.timestamp >= CURRENT_DATE - INTERVAL '1 day'
      AND b.timestamp < CURRENT_DATE
      AND b.block_number % 100 = 0
      AND NOT is_downtime_block(b.block_number)
      AND NOT EXISTS (
          SELECT 1
          FROM proofs p
          JOIN cluster_versions cv ON cv.id = p.cluster_version_id
          WHERE p.block_number = b.block_number
            AND cv.cluster_id = c.id
            AND p.proof_status = 'proved'
      );

    SELECT COUNT(*) INTO missing_count FROM missing_proofs_temp;

    RETURN missing_count;
END;
$$;

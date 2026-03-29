CREATE OR REPLACE FUNCTION detect_downtime_anomalies()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    missing_threshold numeric := 50;
    anomaly_count integer;
    first_block bigint;
    last_block bigint;
    total_1to1 integer;
    total_all integer;
    message_text text;
    telegram_bot_token text;
    telegram_chat_id text;
    telegram_thread_id text;
    telegram_response record;
BEGIN
    PERFORM set_config('search_path', 'public, pg_temp', true);

    SELECT COUNT(*)::integer INTO total_1to1
    FROM clusters c
    INNER JOIN prover_types pt ON c.prover_type_id = pt.id
    WHERE c.is_active = true
      AND c.is_approved = true
      AND pt.processing_ratio = '1:1';

    SELECT COUNT(*)::integer INTO total_all
    FROM clusters c
    WHERE c.is_active = true
      AND c.is_approved = true;

    IF total_1to1 = 0 AND total_all = 0 THEN
        RAISE LOG '[Downtime Detection] No active clusters found, skipping';
        RETURN;
    END IF;

    CREATE TEMP TABLE IF NOT EXISTS anomaly_blocks (
        block_number bigint,
        block_timestamp timestamptz,
        expected_proofs integer,
        actual_proofs integer,
        missing_pct numeric
    );

    DELETE FROM anomaly_blocks;

    INSERT INTO anomaly_blocks (block_number, block_timestamp, expected_proofs, actual_proofs, missing_pct)
    WITH yesterday_blocks AS (
        SELECT b.block_number, b.timestamp
        FROM blocks b
        WHERE b.timestamp >= CURRENT_DATE - INTERVAL '1 day'
          AND b.timestamp < CURRENT_DATE
    ),
    eligible_clusters AS (
        SELECT c.id, pt.processing_ratio
        FROM clusters c
        INNER JOIN prover_types pt ON c.prover_type_id = pt.id
        WHERE c.is_active = true
          AND c.is_approved = true
    ),
    block_expected AS (
        SELECT
            yb.block_number,
            yb.timestamp AS block_timestamp,
            CASE
                WHEN yb.block_number % 100 = 0
                THEN (SELECT COUNT(*) FROM eligible_clusters)
                ELSE (SELECT COUNT(*) FROM eligible_clusters WHERE processing_ratio = '1:1')
            END::integer AS expected_proofs
        FROM yesterday_blocks yb
    ),
    block_actual AS (
        SELECT
            p.block_number,
            COUNT(DISTINCT CASE
                WHEN p.proof_status = 'proved' THEN cv.cluster_id
            END)::integer AS actual_proofs
        FROM proofs p
        INNER JOIN cluster_versions cv ON cv.id = p.cluster_version_id
        INNER JOIN clusters c ON c.id = cv.cluster_id
        INNER JOIN prover_types pt ON pt.id = c.prover_type_id
        WHERE p.block_number IN (SELECT block_number FROM yesterday_blocks)
          AND (
            pt.processing_ratio = '1:1'
            OR (pt.processing_ratio != '1:1' AND p.block_number % 100 = 0)
          )
        GROUP BY p.block_number
    )
    SELECT
        be.block_number,
        be.block_timestamp,
        be.expected_proofs,
        COALESCE(ba.actual_proofs, 0),
        CASE WHEN be.expected_proofs > 0
            THEN ROUND(((be.expected_proofs - COALESCE(ba.actual_proofs, 0))::numeric / be.expected_proofs * 100), 1)
            ELSE 0
        END
    FROM block_expected be
    LEFT JOIN block_actual ba ON ba.block_number = be.block_number
    WHERE be.expected_proofs > 0
      AND ((be.expected_proofs - COALESCE(ba.actual_proofs, 0))::numeric / be.expected_proofs * 100) >= missing_threshold;

    SELECT COUNT(*) INTO anomaly_count FROM anomaly_blocks;

    IF anomaly_count = 0 THEN
        RAISE LOG '[Downtime Detection] No anomalies detected yesterday';
        DROP TABLE IF EXISTS anomaly_blocks;
        RETURN;
    END IF;

    SELECT MIN(block_number), MAX(block_number)
    INTO first_block, last_block
    FROM anomaly_blocks;

    RAISE LOG '[Downtime Detection] Found % anomalous blocks (% - %) where >= %% of expected provers are missing proofs',
        anomaly_count, first_block, last_block, missing_threshold;

    SELECT decrypted_secret INTO telegram_bot_token
    FROM vault.decrypted_secrets
    WHERE name = 'admin_telegram_bot_token';

    SELECT decrypted_secret INTO telegram_chat_id
    FROM vault.decrypted_secrets
    WHERE name = 'admin_telegram_chat_id';

    SELECT decrypted_secret INTO telegram_thread_id
    FROM vault.decrypted_secrets
    WHERE name = 'admin_telegram_thread_id';

    IF telegram_bot_token IS NULL OR telegram_chat_id IS NULL THEN
        RAISE LOG '[Downtime Detection] Telegram not configured, skipping notification';
        DROP TABLE IF EXISTS anomaly_blocks;
        RETURN;
    END IF;

    message_text := E'\u200B\n' || escape_markdown_v2('⚠️ Potential Downtime Detected') || E'\n\n';
    message_text := message_text || 'Found *' || anomaly_count || '* blocks where ' || escape_markdown_v2('>= ' || missing_threshold || '%') || E' of expected provers are missing proofs\.\n\n';
    message_text := message_text || '*Block range:* ' || escape_markdown_v2(first_block::text || ' - ' || last_block::text) || E'\n';
    message_text := message_text || '*1:1 clusters:* ' || total_1to1 || E'\n';
    message_text := message_text || '*All clusters:* ' || total_all || E' ' || escape_markdown_v2('(expected on 00 blocks)') || E'\n\n';
    message_text := message_text || escape_markdown_v2('If this was a platform issue, add a downtime entry before the proof alerts run at 15:00 UTC:') || E'\n\n';
    message_text := message_text || '```sql' || E'\n';
    message_text := message_text || 'INSERT INTO downtime_incidents' || E'\n';
    message_text := message_text || '  (description, start_block, end_block)' || E'\n';
    message_text := message_text || 'VALUES' || E'\n';
    message_text := message_text || '  (''description'', ' || first_block || ', ' || last_block || ');' || E'\n';
    message_text := message_text || '```';

    telegram_response := send_telegram_message(
        telegram_chat_id,
        message_text,
        telegram_bot_token,
        telegram_thread_id
    );

    RAISE LOG '[Downtime Detection] Notification sent. Response: %', telegram_response;

    DROP TABLE IF EXISTS anomaly_blocks;
END;
$$;

SELECT cron.schedule(
    'downtime-detection',
    '0 14 * * *',
    'SELECT detect_downtime_anomalies();'
);

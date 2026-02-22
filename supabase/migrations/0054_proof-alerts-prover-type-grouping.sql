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

CREATE OR REPLACE FUNCTION send_proof_alerts_from_temp()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    prover_type_rec          RECORD;
    cluster                  RECORD;
    perfect_cluster          RECORD;
    missing_count            INTEGER;
    message_text             TEXT := '';
    telegram_bot_token       TEXT;
    telegram_chat_id         TEXT;
    telegram_thread_id       TEXT;
    missing_blocks           TEXT[];
    display_blocks           TEXT;
    cluster_link             TEXT;
    duplicate_blocks_display TEXT;
    total_duplicate_blocks   INTEGER;
    yesterday_text           TEXT;
    visible_link_text        TEXT;
    suffix_text              TEXT;
    visible_more_text        TEXT;
    has_perfect_clusters     BOOLEAN := false;
BEGIN
    PERFORM set_config('search_path', 'public, pg_temp', true);

    telegram_bot_token := get_telegram_bot_token();

    SELECT decrypted_secret INTO telegram_chat_id
    FROM vault.decrypted_secrets
    WHERE name = 'telegram_chat_id';

    SELECT decrypted_secret INTO telegram_thread_id
    FROM vault.decrypted_secrets
    WHERE name = 'telegram_thread_id';

    IF telegram_bot_token IS NULL OR telegram_chat_id IS NULL THEN
        RAISE LOG 'Telegram configuration not found in Vault. Skipping proof alerts.';
        RETURN;
    END IF;

    SELECT COUNT(*) INTO missing_count FROM missing_proofs_temp;

    IF missing_count = 0 THEN
        RAISE LOG 'No missing proofs in missing_proofs_temp. Skipping proof alerts.';
        RETURN;
    END IF;

    RAISE LOG 'Sending proof alerts for % missing proofs', missing_count;

    yesterday_text := to_char(CURRENT_DATE - 1, 'YYYY-MM-DD');

    message_text := E'\u200B\n*Proof status for '
        || escape_markdown_v2(yesterday_text)
        || E':*\n\n';

    FOR prover_type_rec IN
        SELECT pt.id AS prover_type_id, pt.name AS prover_type_name
        FROM prover_types pt
        WHERE EXISTS (
            SELECT 1 FROM clusters c
            WHERE c.prover_type_id = pt.id
              AND c.is_active = true
              AND NOT EXISTS (
                  SELECT 1 FROM missing_proofs_temp m
                  WHERE m.cluster_id = c.id
              )
        )
        ORDER BY pt.id
    LOOP
        IF NOT has_perfect_clusters THEN
            message_text := message_text
                || E'✅ *Clusters up to date:*\n\n';
            has_perfect_clusters := true;
        END IF;

        message_text := message_text
            || E'_' || escape_markdown_v2(prover_type_rec.prover_type_name) || E'_\n';

        FOR perfect_cluster IN
            SELECT c.id, c.name, t.name AS team_name
            FROM clusters c
            JOIN teams t ON t.id = c.team_id
            WHERE c.prover_type_id = prover_type_rec.prover_type_id
              AND c.is_active = true
              AND NOT EXISTS (
                  SELECT 1 FROM missing_proofs_temp m
                  WHERE m.cluster_id = c.id
              )
            ORDER BY t.name, c.name
        LOOP
            cluster_link := 'https://ethproofs.org/cluster/' || perfect_cluster.id;
            visible_link_text := escape_markdown_v2(perfect_cluster.name);

            message_text := message_text
                || E'  ' || '[' || visible_link_text || '](' || cluster_link || ')'
                || ' ' || escape_markdown_v2('(' || perfect_cluster.team_name || ')')
                || E'\n';
        END LOOP;

        message_text := message_text || E'\n';
    END LOOP;

    message_text := message_text
        || E'⚠️ *Found '
        || missing_count
        || E' missing proofs:*\n\n';

    FOR prover_type_rec IN
        SELECT DISTINCT prover_type_id, prover_type_name
        FROM missing_proofs_temp
        ORDER BY prover_type_id
    LOOP
        message_text := message_text
            || E'_' || escape_markdown_v2(prover_type_rec.prover_type_name) || E'_\n\n';

        FOR cluster IN
            SELECT DISTINCT team_name, cluster_nickname, cluster_id_suffix, cluster_id
            FROM missing_proofs_temp
            WHERE prover_type_id = prover_type_rec.prover_type_id
            ORDER BY team_name, cluster_nickname
        LOOP
            SELECT array_agg(block_number ORDER BY block_number)
            INTO missing_blocks
            FROM missing_proofs_temp
            WHERE cluster_id = cluster.cluster_id;

            IF array_length(missing_blocks, 1) > 3 THEN
                suffix_text := ' +' || (array_length(missing_blocks, 1) - 3);
                suffix_text := escape_markdown_v2(suffix_text);

                display_blocks := format(
                    '[%s](https://ethproofs.org/block/%s), [%s](https://ethproofs.org/block/%s), [%s](https://ethproofs.org/block/%s)%s',
                    missing_blocks[1], missing_blocks[1],
                    missing_blocks[2], missing_blocks[2],
                    missing_blocks[3], missing_blocks[3],
                    suffix_text
                );
            ELSE
                SELECT string_agg(
                    format('[%s](https://ethproofs.org/block/%s)', block_num, block_num),
                    ', '
                )
                INTO display_blocks
                FROM unnest(missing_blocks) AS block_num;
            END IF;

            cluster_link := 'https://ethproofs.org/cluster/' || cluster.cluster_id;

            visible_link_text :=
                cluster.cluster_nickname || ' (' || E'\u2026' || cluster.cluster_id_suffix || ')';
            visible_link_text := escape_markdown_v2(visible_link_text);

            message_text := message_text
                || E'▪️ *' || escape_markdown_v2(cluster.team_name) || '* '
                || '[' || visible_link_text || '](' || cluster_link || E')\n';

            message_text := message_text
                || E'   Missing proofs for blocks: '
                || display_blocks
                || E'\n\n';
        END LOOP;
    END LOOP;

    WITH duplicate_block_stats AS (
        SELECT
            block_number,
            COUNT(DISTINCT cluster_id) AS cluster_count
        FROM missing_proofs_temp
        GROUP BY block_number
        HAVING COUNT(DISTINCT cluster_id) > 1
        ORDER BY cluster_count DESC, block_number ASC
    )
    SELECT
        (SELECT COUNT(*) FROM duplicate_block_stats),
        string_agg(
            format(
                '[%s](https://ethproofs.org/block/%s)%s',
                block_number,
                block_number,
                escape_markdown_v2(' (' || cluster_count || ' clusters)')
            ),
            E'\n'
        )
    INTO total_duplicate_blocks, duplicate_blocks_display
    FROM (
        SELECT block_number, cluster_count
        FROM duplicate_block_stats
        LIMIT 5
    ) AS top_blocks;

    IF total_duplicate_blocks > 0 THEN
        message_text := message_text
            || E'🚨 *Blocks missed by multiple clusters:*\n\n';

        WITH ordered_blocks AS (
            SELECT block_number, cluster_count
            FROM (
                SELECT
                    block_number,
                    COUNT(DISTINCT cluster_id) AS cluster_count
                FROM missing_proofs_temp
                GROUP BY block_number
                HAVING COUNT(DISTINCT cluster_id) > 1
            ) AS s
            ORDER BY cluster_count DESC, block_number DESC
            LIMIT 10
        )
        SELECT string_agg(
            format(
                '[%s](https://ethproofs.org/block/%s)%s',
                block_number,
                block_number,
                escape_markdown_v2(' (' || cluster_count || ' clusters)')
            ),
            ', '
        )
        INTO duplicate_blocks_display
        FROM ordered_blocks;

        message_text := message_text
            || duplicate_blocks_display;

        IF total_duplicate_blocks > 10 THEN
            message_text := message_text
                || E', '
                || escape_markdown_v2('+' || (total_duplicate_blocks - 10) || ' more');
        END IF;

        message_text := message_text || E'\n\n';
    END IF;

    PERFORM send_telegram_message(
        telegram_chat_id,
        message_text,
        telegram_bot_token,
        telegram_thread_id
    );

    RAISE LOG 'Proof alerts sent.';
END;
$$;

-- Unschedule the old cron jobs
SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'internal-summary-alerts';
SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'team-alerts';

-- Drop the old team alert functions
DROP FUNCTION IF EXISTS send_team_alerts();
DROP FUNCTION IF EXISTS send_team_alerts_from_temp();

-- Drop the old internal summary functions
DROP FUNCTION IF EXISTS send_internal_summary();
DROP FUNCTION IF EXISTS send_internal_summary_from_temp();

-- Update send_telegram_message to disable web page previews and support topics
CREATE OR REPLACE FUNCTION send_telegram_message(chat_id TEXT, message_text TEXT, bot_token TEXT, thread_id TEXT DEFAULT NULL)
RETURNS RECORD
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    telegram_response RECORD;
    telegram_url TEXT;
    request_body JSONB;
BEGIN
    telegram_url := 'https://api.telegram.org/bot' || bot_token || '/sendMessage';

    RAISE LOG 'Sending Telegram message to % (thread: %): %', chat_id, COALESCE(thread_id, 'none'), message_text;

    -- Build base request body
    request_body := jsonb_build_object(
        'chat_id', chat_id,
        'text', message_text,
        'parse_mode', 'MarkdownV2',
        'disable_web_page_preview', true
    );

    -- Add thread_id if provided
    IF thread_id IS NOT NULL THEN
        request_body := request_body || jsonb_build_object('message_thread_id', thread_id::INTEGER);
    END IF;

    SELECT INTO telegram_response
        net.http_post(
            url := telegram_url,
            headers := '{"Content-Type": "application/json"}'::jsonb,
            body := request_body
        );

    RETURN telegram_response;
END;
$$;

-- Create new send_proof_alerts_from_temp function
CREATE OR REPLACE FUNCTION send_proof_alerts_from_temp()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    cluster RECORD;
    missing_count INTEGER;
    message_text TEXT := '';
    telegram_response RECORD;
    telegram_bot_token TEXT;
    telegram_chat_id TEXT;
    telegram_thread_id TEXT;
    missing_blocks TEXT[];
    display_blocks TEXT;
    cluster_link TEXT;
    duplicate_blocks_display TEXT;
    total_duplicate_blocks INTEGER;
BEGIN
    -- Get Telegram configuration
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

    -- Get count from existing temp table
    SELECT COUNT(*) INTO missing_count FROM missing_proofs_temp;

    RAISE LOG 'Sending proof alerts for % missing proofs', missing_count;

    message_text := E'\u200B\nFound ' || missing_count || E' missing proofs on ' || escape_markdown_v2(to_char(CURRENT_DATE - INTERVAL '1 day', 'YYYY-MM-DD')) || E':\n\n';

    FOR cluster IN
        SELECT DISTINCT team_name, cluster_nickname, cluster_id_suffix, cluster_id
        FROM missing_proofs_temp
        ORDER BY team_name, cluster_nickname
    LOOP
        -- Get missing blocks for this team/cluster combination
        SELECT array_agg(block_number ORDER BY block_number) INTO missing_blocks
        FROM missing_proofs_temp
        WHERE cluster_id = cluster.cluster_id;

        IF array_length(missing_blocks, 1) > 3 THEN
            display_blocks := format('[%s](https://ethproofs\.org/block/%s), [%s](https://ethproofs\.org/block/%s), [%s](https://ethproofs\.org/block/%s) \+%s',
                missing_blocks[1], missing_blocks[1], missing_blocks[2], missing_blocks[2],
                missing_blocks[3], missing_blocks[3], array_length(missing_blocks, 1) - 3);
        ELSE
            SELECT string_agg(format('[%s](https://ethproofs\.org/block/%s)', block_num, block_num), ', ') INTO display_blocks
            FROM unnest(missing_blocks) AS block_num;
        END IF;

        cluster_link := E'https://ethproofs.org/cluster/' || cluster.cluster_id;
        cluster_link := escape_markdown_v2(cluster_link);

        message_text := message_text || E'▪️ *' || escape_markdown_v2(cluster.team_name) || '* \- [' || escape_markdown_v2(cluster.cluster_nickname) || ' \(…' || escape_markdown_v2(cluster.cluster_id_suffix) || E'\\)\](' || cluster_link || E')\n';
        message_text := message_text || E'   Missing proofs for blocks: ' || display_blocks || E'\n\n';
    END LOOP;

    -- Find top 5 blocks missed by multiple clusters, ordered by number of clusters
    WITH duplicate_block_stats AS (
        SELECT
            block_number,
            COUNT(DISTINCT cluster_id) as cluster_count
        FROM missing_proofs_temp
        GROUP BY block_number
        HAVING COUNT(DISTINCT cluster_id) > 1
        ORDER BY cluster_count DESC, block_number ASC
    )
    SELECT
        (SELECT COUNT(*) FROM duplicate_block_stats),
        string_agg(
            format('[%s](https://ethproofs\.org/block/%s) \(%s clusters\)',
                block_number,
                block_number,
                cluster_count
            ),
            E'\n'
        )
    INTO total_duplicate_blocks, duplicate_blocks_display
    FROM (
        SELECT block_number, cluster_count
        FROM duplicate_block_stats
        LIMIT 5
    ) top_blocks;

    -- Add duplicate blocks section if any exist
    IF total_duplicate_blocks > 0 THEN
        message_text := message_text || E'Blocks missed by multiple clusters:\n\n' || duplicate_blocks_display;

        IF total_duplicate_blocks > 5 THEN
            message_text := message_text || E'\n[\+' || (total_duplicate_blocks - 5) || E' more](https://ethproofs\.org/status)';
        END IF;

        message_text := message_text || E'\n';
    END IF;

    -- Send to alerts Telegram channel
    telegram_response := send_telegram_message(telegram_chat_id, message_text, telegram_bot_token, telegram_thread_id);

    RAISE LOG 'Proof alerts sent. Response: %', telegram_response;
END;
$$;

-- Create new send_proof_alerts function
CREATE OR REPLACE FUNCTION send_proof_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    missing_count INTEGER;
BEGIN
    RAISE LOG 'Starting proof monitoring alerts...';

    -- Get missing proofs data
    missing_count := populate_missing_proofs_temp();

    IF missing_count = 0 THEN
        RAISE LOG 'All active clusters are up to date with proof submissions';
        DROP TABLE IF EXISTS missing_proofs_temp;
        RETURN;
    END IF;

    RAISE LOG 'Found % missing proofs, sending alerts...', missing_count;

    PERFORM send_proof_alerts_from_temp();

    -- Clean up temp table
    DROP TABLE IF EXISTS missing_proofs_temp;

    RAISE LOG 'Proof alerts completed';
END;
$$;

-- Schedule proof alerts at 3 PM UTC
SELECT cron.schedule(
    'proof-alerts',
    '0 15 * * *',
    'SELECT send_proof_alerts();'
);

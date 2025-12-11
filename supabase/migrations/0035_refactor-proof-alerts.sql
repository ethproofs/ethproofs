-- Unschedule the old cron jobs
SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'internal-summary-alerts';
SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'team-alerts';

-- Drop the old team alert functions
DROP FUNCTION IF EXISTS send_team_alerts();
DROP FUNCTION IF EXISTS send_team_alerts_from_temp();

-- Drop the old internal summary functions
DROP FUNCTION IF EXISTS send_internal_summary();
DROP FUNCTION IF EXISTS send_internal_summary_from_temp();

-- Drop the old send_telegram_message signature
DROP FUNCTION IF EXISTS send_telegram_message(TEXT, TEXT, TEXT);

-- Update send_telegram_message to disable web page previews and support topics
CREATE OR REPLACE FUNCTION send_telegram_message(
    chat_id      TEXT,
    message_text TEXT,
    bot_token    TEXT,
    thread_id    TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    telegram_url TEXT;
    request_body JSONB;
    request_id   BIGINT;
BEGIN
    -- Harden SECURITY DEFINER: only look in public + pg_temp
    PERFORM set_config('search_path', 'public, pg_temp', true);

    telegram_url := 'https://api.telegram.org/bot' || bot_token || '/sendMessage';

    -- Telegram hard limit is 4096 chars. Keep some margin and truncate if needed.
    IF length(message_text) > 4000 THEN
        message_text := left(message_text, 3990) || E'\n…(truncated)';
    END IF;

    RAISE LOG 'Sending Telegram message to % (thread: %)',
        chat_id,
        COALESCE(thread_id, 'none');

    -- Build base request body (text is already MarkdownV2-escaped by callers)
    request_body := jsonb_build_object(
        'chat_id', chat_id,
        'text', message_text,
        'parse_mode', 'MarkdownV2',
        'disable_web_page_preview', true
    );

    -- Add topic/thread id if it looks numeric
    IF thread_id IS NOT NULL AND thread_id ~ '^[0-9]+$' THEN
        request_body := request_body
            || jsonb_build_object('message_thread_id', thread_id::INTEGER);
    END IF;

    -- net.http_post returns a request id; the actual HTTP response
    -- will appear later in net._http_response
    SELECT net.http_post(
        url     := telegram_url,
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body    := request_body
    )
    INTO request_id;

    RAISE LOG 'Telegram request queued with id %', request_id;
END;
$$;

-- Create new send_proof_alerts_from_temp function
CREATE OR REPLACE FUNCTION send_proof_alerts_from_temp()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    cluster                  RECORD;
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
BEGIN
    -- Harden SECURITY DEFINER: only look in public + pg_temp
    PERFORM set_config('search_path', 'public, pg_temp', true);

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

    -- Ensure temp table actually has data
    SELECT COUNT(*) INTO missing_count FROM missing_proofs_temp;

    IF missing_count = 0 THEN
        RAISE LOG 'No missing proofs in missing_proofs_temp. Skipping proof alerts.';
        RETURN;
    END IF;

    RAISE LOG 'Sending proof alerts for % missing proofs', missing_count;

    yesterday_text := to_char(CURRENT_DATE - 1, 'YYYY-MM-DD');

    -- Header line; escape only the dynamic date
    message_text := E'\u200B\nFound '
        || missing_count
        || ' missing proofs on '
        || escape_markdown_v2(yesterday_text)
        || E':\n\n';

    -- Per-cluster section
    FOR cluster IN
        SELECT DISTINCT team_name, cluster_nickname, cluster_id_suffix, cluster_id
        FROM missing_proofs_temp
        ORDER BY team_name, cluster_nickname
    LOOP
        -- Get missing blocks for this team/cluster combination
        SELECT array_agg(block_number ORDER BY block_number)
        INTO missing_blocks
        FROM missing_proofs_temp
        WHERE cluster_id = cluster.cluster_id;

        -- Build the display for blocks
        IF array_length(missing_blocks, 1) > 3 THEN
            -- Visible suffix: " +N" (escaped via helper so '+' becomes '\+')
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

        -- Raw URL (do NOT escape)
        cluster_link := 'https://ethproofs.org/cluster/' || cluster.cluster_id;

        -- Visible text for the link: "nickname (…suffix)" escaped as a whole
        visible_link_text :=
            cluster.cluster_nickname || ' (…' || cluster.cluster_id_suffix || ')';
        visible_link_text := escape_markdown_v2(visible_link_text);

        -- Team name escaped, link text escaped, URL raw
        message_text := message_text
            || E'▪️ *' || escape_markdown_v2(cluster.team_name) || '* '
            || '[' || visible_link_text || '](' || cluster_link || E')\n';

        message_text := message_text
            || E'   Missing proofs for blocks: '
            || display_blocks
            || E'\n\n';
    END LOOP;

    -- Find top 5 blocks missed by multiple clusters, ordered by number of clusters
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
                -- visible suffix " (N clusters)" escaped via helper
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

    -- Add duplicate blocks section if any exist
    IF total_duplicate_blocks > 0 THEN
        message_text := message_text
            || E'*Blocks missed by multiple clusters:*\n\n';

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

        -- If more than 10 duplicates exist, show "+N more" (escaped, no link)
        IF total_duplicate_blocks > 10 THEN
            message_text := message_text
                || E', '
                || escape_markdown_v2('+' || (total_duplicate_blocks - 10) || ' more');
        END IF;

        message_text := message_text || E'\n\n';
    END IF;

    -- Send to alerts Telegram channel
    PERFORM send_telegram_message(
        telegram_chat_id,
        message_text,
        telegram_bot_token,
        telegram_thread_id
    );

    RAISE LOG 'Proof alerts sent.';
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
    -- Harden SECURITY DEFINER: only look in public + pg_temp
    PERFORM set_config('search_path', 'public, pg_temp', true);

    RAISE LOG 'Starting proof monitoring alerts...';

    -- Get missing proofs data (expected to create/refresh missing_proofs_temp)
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

-- Unschedule any existing proof-alert job before re-creating it
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'proof-alerts';

-- (Re)create proof alerts job at 3 PM UTC
SELECT cron.schedule(
    'proof-alerts',
    '0 15 * * *',
    'SELECT send_proof_alerts();'
);

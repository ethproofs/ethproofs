-- Required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Add chat_id column to teams table for Telegram bot integration
ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "chat_id" text;

-- Helper function to escape MarkdownV2 reserved characters
CREATE OR REPLACE FUNCTION escape_markdown_v2(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    IF input_text IS NULL THEN
        RETURN NULL;
    END IF;

    -- MarkdownV2 reserved characters: _ *  ~ ` > # + - = | { } . !
    input_text := replace(input_text, '_', '\_');
    input_text := replace(input_text, '[', '\[');
    input_text := replace(input_text, ']', '\]');
    input_text := replace(input_text, '(', '\(');
    input_text := replace(input_text, ')', '\)');
    input_text := replace(input_text, '~', '\~');
    input_text := replace(input_text, '`', '\`');
    input_text := replace(input_text, '>', '\>');
    input_text := replace(input_text, '#', '\#');
    input_text := replace(input_text, '+', '\+');
    input_text := replace(input_text, '-', '\-');
    input_text := replace(input_text, '=', '\=');
    input_text := replace(input_text, '|', '\|');
    input_text := replace(input_text, '{', '\{');
    input_text := replace(input_text, '}', '\}');
    input_text := replace(input_text, '.', '\.');
    input_text := replace(input_text, '!', '\!');

    RETURN input_text;
END;
$$;

CREATE OR REPLACE FUNCTION get_telegram_bot_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    bot_token TEXT;
BEGIN
    SELECT decrypted_secret INTO bot_token 
    FROM vault.decrypted_secrets 
    WHERE name = 'telegram_bot_token';
    
    RETURN bot_token;
END;
$$;

CREATE OR REPLACE FUNCTION send_telegram_message(chat_id TEXT, message_text TEXT, bot_token TEXT)
RETURNS RECORD
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    telegram_response RECORD;
    telegram_url TEXT;
BEGIN
    telegram_url := 'https://api.telegram.org/bot' || bot_token || '/sendMessage';

    RAISE LOG 'Sending Telegram message to %: %', chat_id, message_text;
    
    SELECT INTO telegram_response
        net.http_post(
            url := telegram_url,
            headers := '{"Content-Type": "application/json"}'::jsonb,
            body := jsonb_build_object(
                'chat_id', chat_id,
                'text', message_text,
                'parse_mode', 'MarkdownV2'
            )
        );
    
    RETURN telegram_response;
END;
$$;

CREATE OR REPLACE FUNCTION populate_missing_proofs_temp()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    missing_count INTEGER;
BEGIN
    -- Create temporary table to collect missing proofs
    CREATE TEMP TABLE IF NOT EXISTS missing_proofs_temp (
        team_id UUID,
        team_name TEXT,
        cluster_id UUID,
        cluster_nickname TEXT,
        cluster_id_suffix TEXT,
        block_number BIGINT
    );

    -- Clear temp table
    DELETE FROM missing_proofs_temp;

    -- Find all missing proofs from the previous day
    INSERT INTO missing_proofs_temp (team_id, team_name, cluster_id, cluster_nickname, cluster_id_suffix, block_number)
    SELECT c.team_id, c.team_name, c.id, c.nickname, RIGHT(c.id::text, 6), b.block_number
    FROM blocks b
    CROSS JOIN LATERAL (
        SELECT c.id, c.nickname, c.team_id, t.name as team_name
        FROM clusters c
        JOIN teams t ON t.id = c.team_id
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
    
    -- Get the count of missing proofs
    SELECT COUNT(*) INTO missing_count FROM missing_proofs_temp;
    
    RETURN missing_count;
END;
$$;

CREATE OR REPLACE FUNCTION send_internal_summary_from_temp()
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
    missing_blocks TEXT[];
    display_blocks TEXT;
BEGIN
    -- Get Telegram configuration
    telegram_bot_token := get_telegram_bot_token();
    
    SELECT decrypted_secret INTO telegram_chat_id 
    FROM vault.decrypted_secrets 
    WHERE name = 'telegram_chat_id';
    
    IF telegram_bot_token IS NULL OR telegram_chat_id IS NULL THEN
        RAISE LOG 'Telegram configuration not found in Vault. Skipping internal alert.';
        RETURN;
    END IF;

    -- Get count from existing temp table
    SELECT COUNT(*) INTO missing_count FROM missing_proofs_temp;
    
    RAISE LOG 'Sending internal summary for % missing proofs', missing_count;

    message_text := E'🚨 *Missing Proof Alert*\n\nFound ' || missing_count || E' missing proofs on ' || escape_markdown_v2(to_char(CURRENT_DATE - INTERVAL '1 day', 'YYYY-MM-DD')) || E':\n\n';
    
    FOR cluster IN
        SELECT DISTINCT team_name, cluster_nickname, cluster_id_suffix
        FROM missing_proofs_temp
        ORDER BY team_name, cluster_nickname
    LOOP
        -- Get missing blocks for this team/cluster combination
        SELECT array_agg(block_number ORDER BY block_number) INTO missing_blocks
        FROM missing_proofs_temp
        WHERE team_name = cluster.team_name 
          AND cluster_nickname = cluster.cluster_nickname
          AND cluster_id_suffix = cluster.cluster_id_suffix;

        IF array_length(missing_blocks, 1) > 3 THEN
            display_blocks := missing_blocks[1] || ', ' || missing_blocks[2] || ', ' || missing_blocks[3] || ' +' || (array_length(missing_blocks, 1) - 3) || ' more';
        ELSE
            display_blocks := array_to_string(missing_blocks, ', ');
        END IF;

        message_text := message_text || E'▪️ *' || escape_markdown_v2(cluster.team_name) || '* \- ' || escape_markdown_v2(cluster.cluster_nickname) || ' \(…' || escape_markdown_v2(cluster.cluster_id_suffix) || E'\\)\n';
        message_text := message_text || E'   Missing proofs for blocks: `' || display_blocks || E'`\n\n';
    END LOOP;
    
    -- Send to internal Telegram chat
    telegram_response := send_telegram_message(telegram_chat_id, message_text, telegram_bot_token);
    
    RAISE LOG 'Internal summary sent. Response: %', telegram_response;
END;
$$;

CREATE OR REPLACE FUNCTION send_team_alerts_from_temp()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    team_record RECORD;
    cluster_record RECORD;
    missing_blocks TEXT[];
    display_blocks TEXT;
    message_text TEXT;
    telegram_response RECORD;
    telegram_bot_token TEXT;
    cluster_count INTEGER;
    total_missing INTEGER;
    cluster_link TEXT;
BEGIN
    -- Get Telegram bot token
    telegram_bot_token := get_telegram_bot_token();
    
    IF telegram_bot_token IS NULL THEN
        RAISE LOG 'Telegram bot token not found in Vault. Skipping team alerts.';
        RETURN;
    END IF;

    RAISE LOG 'Starting team-specific alerts from existing data...';

    -- Send alerts to each team that has chat_id configured
    FOR team_record IN
        SELECT DISTINCT tmp.team_id, tmp.team_name, t.chat_id
        FROM missing_proofs_temp tmp
        JOIN teams t ON t.id = tmp.team_id
        WHERE t.chat_id IS NOT NULL
    LOOP
        -- Count total missing blocks for this team
        SELECT COUNT(*) INTO total_missing
        FROM missing_proofs_temp
        WHERE team_id = team_record.team_id;

        -- Add header with title and date context
        message_text := E'🚨 *Missing Proof Alert*\n\n' ||
                        E'Missing proofs for *' || total_missing || '* blocks from yesterday \(' || escape_markdown_v2(to_char(CURRENT_DATE - INTERVAL '1 day', 'YYYY-MM-DD')) || E'\\) have been detected\\. \n';
        cluster_count := 0;
        
        -- Process each cluster for this team
        FOR cluster_record IN
            SELECT DISTINCT cluster_id, cluster_nickname, cluster_id_suffix
            FROM missing_proofs_temp
            WHERE team_id = team_record.team_id
            ORDER BY cluster_nickname
        LOOP
            cluster_count := cluster_count + 1;
            
            -- Get missing blocks for this cluster (first 3 + count)
            SELECT array_agg(block_number ORDER BY block_number) INTO missing_blocks
            FROM missing_proofs_temp
            WHERE team_id = team_record.team_id 
              AND cluster_id = cluster_record.cluster_id;
            
            IF array_length(missing_blocks, 1) > 3 THEN
                display_blocks := missing_blocks[1] || ', ' || missing_blocks[2] || ', ' || missing_blocks[3] || ' +' || (array_length(missing_blocks, 1) - 3) || ' more';
            ELSE
                display_blocks := array_to_string(missing_blocks, ', ');
            END IF;
            
            IF cluster_count = 1 THEN
                message_text := message_text || E'\n';
            END IF;

            cluster_link := E'https://ethproofs.com/cluster/' || cluster_record.cluster_id;
            cluster_link := escape_markdown_v2(cluster_link);

            message_text := message_text || E' • [*' || cluster_record.cluster_nickname || '* \(…' || cluster_record.cluster_id_suffix || '\)](' || cluster_link || E')\n' ||
                           E'   Missing blocks: `' || display_blocks || E'`\n';
            
            IF cluster_count < (SELECT COUNT(DISTINCT cluster_id) FROM missing_proofs_temp WHERE team_id = team_record.team_id) THEN
                message_text := message_text || E'\n';
            END IF;
        END LOOP;

        message_text := message_text || E'\nPlease confirm your prover is online and submitting proofs for every 100 blocks\\.';
        
        -- Send to team's Telegram chat
        telegram_response := send_telegram_message(team_record.chat_id, message_text, telegram_bot_token);
        
        RAISE LOG 'Team alert sent to % (chat_id: %). Response: %', team_record.team_name, team_record.chat_id, telegram_response;
        
        -- 1 second delay between team alerts to avoid rate limits
        PERFORM pg_sleep(1);
    END LOOP;

    RAISE LOG 'Team alerts from temp completed';
END;
$$;

-- Send both internal summary and team alerts
CREATE OR REPLACE FUNCTION send_proof_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    missing_count INTEGER;
BEGIN
    RAISE LOG 'Starting proof monitoring alerts...';
    
    -- Get missing proofs data once
    missing_count := populate_missing_proofs_temp();
    
    IF missing_count = 0 THEN
        RAISE LOG 'All active clusters are up to date with proof submissions';
        DROP TABLE IF EXISTS missing_proofs_temp;
        RETURN;
    END IF;
    
    RAISE LOG 'Found % missing proofs, sending alerts...', missing_count;
    
    PERFORM send_internal_summary_from_temp();
    
    -- 1 second delay before team alerts to avoid rate limits
    PERFORM pg_sleep(1);
    
    PERFORM send_team_alerts_from_temp();
    
    -- Clean up
    DROP TABLE IF EXISTS missing_proofs_temp;
    
    RAISE LOG 'All proof alerts completed';
END;
$$;

-- Run daily at 2 PM UTC (9 AM NY / 3 PM Europe) - Both internal summary and team alerts
SELECT cron.schedule(
    'proof-monitoring-alerts',
    '0 14 * * *',
    'SELECT send_proof_alerts();'
);
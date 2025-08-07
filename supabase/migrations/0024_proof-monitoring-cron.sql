-- Required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION check_missing_proofs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    cluster RECORD;
    missing_count INTEGER := 0;
    message_text TEXT := '';
    telegram_response RECORD;
    telegram_url TEXT;
    telegram_bot_token TEXT;
    telegram_chat_id TEXT;
    team_missing_blocks TEXT := '';
BEGIN
    -- Get Telegram configuration from Vault
    SELECT decrypted_secret INTO telegram_bot_token 
    FROM vault.decrypted_secrets 
    WHERE name = 'telegram_bot_token';
    
    SELECT decrypted_secret INTO telegram_chat_id 
    FROM vault.decrypted_secrets 
    WHERE name = 'telegram_chat_id';
    
    IF telegram_bot_token IS NULL OR telegram_chat_id IS NULL THEN
        RAISE LOG 'Telegram configuration not found in Vault (telegram_bot_token or telegram_chat_id missing). Skipping alert.';
        RETURN;
    END IF;

    RAISE LOG 'Starting proof monitoring check...';

    -- Create temporary table to collect missing proofs
    CREATE TEMP TABLE IF NOT EXISTS missing_proofs_temp (
        team_name TEXT,
        cluster_nickname TEXT,
        block_number BIGINT
    );

    -- Clear temp table
    DELETE FROM missing_proofs_temp;

    -- Find all missing proofs from the previous day
    INSERT INTO missing_proofs_temp (team_name, cluster_nickname, block_number)
    SELECT c.team_name, c.nickname, b.block_number
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

    RAISE LOG 'Found % missing proofs', missing_count;

    -- Only send alert if there are missing proofs
    IF missing_count > 0 THEN
        message_text := E'🚨 *Missing Proof Alert*\n\nFound ' || missing_count || E' missing proofs in the last 24 hours:\n\n';
        
        -- Group missing proofs by team and cluster for better readability
        FOR cluster IN
            SELECT DISTINCT team_name, cluster_nickname
            FROM missing_proofs_temp
            ORDER BY team_name, cluster_nickname
        LOOP
            -- Get missing blocks for this team/cluster combination
            SELECT string_agg(block_number::text, ', ' ORDER BY block_number)
            INTO team_missing_blocks
            FROM missing_proofs_temp
            WHERE team_name = cluster.team_name 
              AND cluster_nickname = cluster.cluster_nickname;
            
            message_text := message_text || '*' || cluster.team_name || '* - ' || cluster.cluster_nickname || E'\n';
            message_text := message_text || 'Missing blocks: ' || team_missing_blocks || E'\n\n';
        END LOOP;
        
        message_text := message_text || E'\nTime: ' || NOW()::text;
        
        -- Escape all reserved characters for MarkdownV2
        -- MarkdownV2 reserved characters: _ * [ ] ( ) ~ ` > # + - = | { } . !
        message_text := replace(message_text, '_', '\_');
        message_text := replace(message_text, '[', '\[');
        message_text := replace(message_text, ']', '\]');
        message_text := replace(message_text, '(', '\(');
        message_text := replace(message_text, ')', '\)');
        message_text := replace(message_text, '~', '\~');
        message_text := replace(message_text, '`', '\`');
        message_text := replace(message_text, '>', '\>');
        message_text := replace(message_text, '#', '\#');
        message_text := replace(message_text, '+', '\+');
        message_text := replace(message_text, '-', '\-');
        message_text := replace(message_text, '=', '\=');
        message_text := replace(message_text, '|', '\|');
        message_text := replace(message_text, '{', '\{');
        message_text := replace(message_text, '}', '\}');
        message_text := replace(message_text, '.', '\.');
        message_text := replace(message_text, '!', '\!');
        
        -- Send to Telegram using pg_net
        telegram_url := 'https://api.telegram.org/bot' || telegram_bot_token || '/sendMessage';
        
        SELECT INTO telegram_response
            net.http_post(
                url := telegram_url,
                headers := '{"Content-Type": "application/json"}'::jsonb,
                body := jsonb_build_object(
                    'chat_id', telegram_chat_id,
                    'text', message_text,
                    'parse_mode', 'MarkdownV2'
                )
            );
        
        RAISE LOG 'Telegram alert sent. Response: %', telegram_response;
    ELSE
        RAISE LOG 'All active clusters are up to date with proof submissions';
    END IF;

    -- Clean up
    DROP TABLE IF EXISTS missing_proofs_temp;
END;
$$;

-- Run daily at 1 PM UTC (8 AM NY / 2 PM Europe)
SELECT cron.schedule(
    'proof-monitoring-alert',
    '0 13 * * *',
    'SELECT check_missing_proofs();'
);
-- GPU Price Index - Weekly Cron Job
-- This migration sets up a cron job to fetch GPU prices from Vast.ai API
-- and insert the median price into the gpu_price_index table weekly.
--
-- SETUP REQUIRED:
-- Before running this migration, you must add the Vast.ai API key to Supabase Vault:
--
--   INSERT INTO vault.secrets (name, secret)
--   VALUES ('vastai_api_key', 'YOUR_VASTAI_API_KEY_HERE');
--
-- Or via Supabase Dashboard:
--   1. Go to Project Settings > Vault
--   2. Add new secret with name: vastai_api_key
--   3. Add your Vast.ai API key as the value
--
-- NOTE FOR LOCAL TESTING:
--   In local development, pg_net background worker may have delays.
--   For testing, create an app_config table with the API key:
--     CREATE TABLE app_config (key TEXT PRIMARY KEY, value TEXT);
--     INSERT INTO app_config VALUES ('vastai_api_key', 'YOUR_KEY');
--   The function will fallback to app_config if vault is unavailable.
--
-- Required extensions for HTTP requests and cron scheduling
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Function to retrieve Vast.ai API key from Supabase Vault (with local dev fallback)
CREATE OR REPLACE FUNCTION get_vastai_api_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    api_key TEXT;
BEGIN
    -- Try vault first (production)
    BEGIN
        SELECT decrypted_secret INTO api_key
        FROM vault.decrypted_secrets
        WHERE name = 'vastai_api_key';
    EXCEPTION
        WHEN OTHERS THEN
            -- Vault not available, will try fallback
            api_key := NULL;
    END;

    -- Fallback to app_config if vault didn't return a key
    IF api_key IS NULL THEN
        BEGIN
            SELECT value INTO api_key
            FROM app_config
            WHERE key = 'vastai_api_key';
        EXCEPTION
            WHEN OTHERS THEN
                -- app_config not available either
                api_key := NULL;
        END;
    END IF;

    RETURN api_key;
END;
$$;

-- Function to fetch GPU prices from Vast.ai and insert median price
CREATE OR REPLACE FUNCTION update_gpu_price_index()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    api_key TEXT;
    request_id BIGINT;
    response_record RECORD;
    response_body JSONB;
    prices NUMERIC[];
    median_price NUMERIC;
    gpu_model TEXT := 'RTX 5090';
    max_wait INTEGER := 60; -- Wait up to 60 seconds for response
    wait_count INTEGER := 0;
BEGIN
    -- Get API key from vault
    api_key := get_vastai_api_key();

    IF api_key IS NULL THEN
        RAISE LOG 'Vast.ai API key not found in Vault. Skipping GPU price update.';
        RETURN;
    END IF;

    RAISE LOG 'Fetching GPU prices for % from Vast.ai...', gpu_model;

    -- Make async POST request to Vast.ai API and get request ID
    SELECT net.http_post(
        url := 'https://console.vast.ai/api/v0/bundles/',
        headers := jsonb_build_object(
            'Authorization', api_key,
            'Content-Type', 'application/json'
        ),
        body := jsonb_build_object(
            'limit', 100,
            'type', 'on-demand',
            'verified', jsonb_build_object('eq', true),
            'gpu_name', jsonb_build_object('eq', gpu_model)
        )
    ) INTO request_id;

    RAISE LOG 'HTTP request queued with ID: %', request_id;

    -- Poll for response (pg_net processes requests asynchronously)
    LOOP
        PERFORM pg_sleep(1);

        SELECT * INTO response_record
        FROM net._http_response
        WHERE id = request_id;

        IF response_record.id IS NOT NULL THEN
            RAISE LOG 'Response received after % seconds', wait_count;
            EXIT;
        END IF;

        wait_count := wait_count + 1;
        IF wait_count >= max_wait THEN
            RAISE LOG 'Timeout waiting for API response after % seconds', wait_count;
            RETURN;
        END IF;
    END LOOP;

    RAISE LOG 'Response status: %', response_record.status_code;

    -- Check if request was successful
    IF response_record.status_code != 200 THEN
        RAISE LOG 'Vast.ai API request failed with status %: %', response_record.status_code, response_record.content;
        RETURN;
    END IF;

    -- Parse response
    response_body := response_record.content::jsonb;

    -- Validate response structure
    IF response_body IS NULL THEN
        RAISE LOG 'Response body is NULL or invalid JSON';
        RETURN;
    END IF;

    IF NOT (response_body ? 'offers') THEN
        RAISE LOG 'Response body missing "offers" field. Response: %', response_body;
        RETURN;
    END IF;

    IF jsonb_typeof(response_body->'offers') != 'array' THEN
        RAISE LOG 'Response "offers" field is not an array, got type: %. Response: %',
                  jsonb_typeof(response_body->'offers'), response_body;
        RETURN;
    END IF;

    -- Extract dph_total prices from all offers
    SELECT array_agg((offer->>'dph_total')::numeric)
    INTO prices
    FROM jsonb_array_elements(response_body->'offers') AS offer
    WHERE offer->>'dph_total' IS NOT NULL;

    -- Check if we got any prices
    IF prices IS NULL OR array_length(prices, 1) = 0 THEN
        RAISE LOG 'No prices found for % in Vast.ai response', gpu_model;
        RETURN;
    END IF;

    -- Calculate median price using percentile_cont
    SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY price)
    INTO median_price
    FROM unnest(prices) AS price;

    RAISE LOG 'Calculated median price for %: $ %/hour from % offers', gpu_model, median_price, array_length(prices, 1);

    -- Insert new price entry
    INSERT INTO gpu_price_index (gpu_name, hourly_price)
    VALUES (gpu_model, median_price);

    RAISE LOG 'Successfully inserted GPU price index entry for %', gpu_model;

EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error updating GPU price index: %', SQLERRM;
END;
$$;

-- Unschedule existing job if it exists (for idempotent re-runs)
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'update-gpu-price-index-weekly';

-- Schedule cron job to run every Sunday at 00:00 UTC
SELECT cron.schedule(
    'update-gpu-price-index-weekly',
    '0 0 * * 0',
    'SELECT update_gpu_price_index();'
);

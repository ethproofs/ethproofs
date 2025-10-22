-- Unschedule old combined job if present
SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'proof-monitoring-alerts';

-- Drop the old combined function since we now have separate functions
DROP FUNCTION IF EXISTS send_proof_alerts();

-- Create standalone internal summary function
CREATE OR REPLACE FUNCTION send_internal_summary()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    missing_count INTEGER;
BEGIN
    RAISE LOG 'Starting internal summary generation...';

    -- Get missing proofs data
    missing_count := populate_missing_proofs_temp();

    IF missing_count = 0 THEN
        RAISE LOG 'All active clusters are up to date with proof submissions - no internal summary needed';
        DROP TABLE IF EXISTS missing_proofs_temp;
        RETURN;
    END IF;

    RAISE LOG 'Found % missing proofs, sending internal summary...', missing_count;

    PERFORM send_internal_summary_from_temp();

    -- Clean up temp table
    DROP TABLE IF EXISTS missing_proofs_temp;

    RAISE LOG 'Internal summary completed';
END;
$$;

-- Create standalone team alerts function
CREATE OR REPLACE FUNCTION send_team_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    missing_count INTEGER;
BEGIN
    RAISE LOG 'Starting team alerts generation...';

    -- Get missing proofs data
    missing_count := populate_missing_proofs_temp();

    IF missing_count = 0 THEN
        RAISE LOG 'All active clusters are up to date with proof submissions - no team alerts needed';
        DROP TABLE IF EXISTS missing_proofs_temp;
        RETURN;
    END IF;

    RAISE LOG 'Found % missing proofs, sending team alerts...', missing_count;

    PERFORM send_team_alerts_from_temp();

    -- Clean up temp table
    DROP TABLE IF EXISTS missing_proofs_temp;

    RAISE LOG 'Team alerts completed';
END;
$$;

-- Schedule internal summary at 1 PM UTC (1 hour before team alerts)
SELECT cron.schedule(
    'internal-summary-alerts',
    '0 13 * * *',
    'SELECT send_internal_summary();'
);

-- Schedule team alerts at 2 PM UTC (original time)
SELECT cron.schedule(
    'team-alerts',
    '0 14 * * *',
    'SELECT send_team_alerts();'
);

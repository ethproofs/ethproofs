-- Deprecate the daily proof-status alert posted to the community Telegram channel.
--
-- Deactivates the job rather than unscheduling it, so the schedule and command are
-- preserved and re-enabling is a single statement:
--   SELECT cron.alter_job(jobid, active := true) FROM cron.job WHERE jobname = 'proof-alerts';
--
-- The alert functions (send_proof_alerts, send_proof_alerts_from_temp,
-- populate_missing_proofs_temp) and the telegram_chat_id / telegram_thread_id vault
-- secrets are intentionally left in place; drop them in a follow-up once the
-- deprecation has settled.
--
-- Unaffected: the 'downtime-detection' job (posts to admin_telegram_chat_id) and the
-- 5xx/timeout reporting in lib/middleware/with-telemetry.ts. Both share
-- get_telegram_bot_token() / the same bot, which must keep working.

DO $$
DECLARE
    proof_alerts_job_id BIGINT;
BEGIN
    SELECT jobid INTO proof_alerts_job_id
    FROM cron.job
    WHERE jobname = 'proof-alerts';

    IF proof_alerts_job_id IS NULL THEN
        RAISE LOG 'proof-alerts job not found. Nothing to deactivate.';
        RETURN;
    END IF;

    PERFORM cron.alter_job(job_id := proof_alerts_job_id, active := false);

    RAISE LOG 'proof-alerts job % deactivated. Daily community alerts stopped.', proof_alerts_job_id;
END;
$$;

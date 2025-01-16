ALTER TABLE "proofs" ADD CONSTRAINT "proof_status_timestamp_check" CHECK (
        (proof_status = 'proved' AND proved_timestamp IS NOT NULL) or
        (proof_status = 'proving' AND proving_timestamp IS NOT NULL) or
        (proof_status = 'queued' AND queued_timestamp IS NOT NULL));
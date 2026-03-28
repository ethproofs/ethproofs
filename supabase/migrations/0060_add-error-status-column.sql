ALTER TABLE "proofs" ADD COLUMN "error_status" text;

ALTER TABLE "proofs" ADD CONSTRAINT "proofs_error_status_check"
  CHECK (
    (proof_status = 'error' AND error_status = ANY (ARRAY['queued'::text, 'proving'::text, 'proved'::text]))
    OR (proof_status != 'error' AND error_status IS NULL)
  );

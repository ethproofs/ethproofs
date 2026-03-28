ALTER TABLE "proofs" DROP CONSTRAINT "proofs_proof_status_check";

ALTER TABLE "proofs" ADD CONSTRAINT "proofs_proof_status_check"
  CHECK (proof_status = ANY (ARRAY['queued'::text, 'proving'::text, 'proved'::text, 'error'::text]));

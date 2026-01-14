ALTER TABLE zkvm_security_metrics DROP COLUMN protocol_soundness;
ALTER TABLE zkvm_security_metrics DROP COLUMN trusted_setup;
ALTER TABLE zkvm_security_metrics ADD COLUMN soundcalc_integration boolean NOT NULL DEFAULT false;

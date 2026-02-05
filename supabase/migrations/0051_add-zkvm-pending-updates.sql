ALTER TABLE "zkvms" ADD COLUMN "pending_updates" jsonb;
ALTER TABLE "zkvms" ADD COLUMN "update_status" text;

UPDATE "zkvms" SET "update_status" = 'pending' WHERE "approved" = false;

SELECT setval(pg_get_serial_sequence('zkvms', 'id'), COALESCE((SELECT MAX(id) FROM zkvms), 0));
SELECT setval(pg_get_serial_sequence('zkvm_versions', 'id'), COALESCE((SELECT MAX(id) FROM zkvm_versions), 0));
SELECT setval(pg_get_serial_sequence('zkvm_security_metrics', 'id'), COALESCE((SELECT MAX(id) FROM zkvm_security_metrics), 0));
SELECT setval(pg_get_serial_sequence('zkvm_performance_metrics', 'id'), COALESCE((SELECT MAX(id) FROM zkvm_performance_metrics), 0));

ALTER TABLE "zkvm_versions" ADD CONSTRAINT "zkvm_versions_zkvm_id_version_uk" UNIQUE("zkvm_id", "version");

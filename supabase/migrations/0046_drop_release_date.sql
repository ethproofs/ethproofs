-- Drop release_date column from zkvm_versions table
-- This field is typically null and not being used effectively

ALTER TABLE zkvm_versions DROP COLUMN release_date;

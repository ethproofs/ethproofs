ALTER TABLE zkvms DROP COLUMN continuations;
ALTER TABLE zkvms DROP COLUMN parallelizable_proving;
ALTER TABLE zkvms DROP COLUMN precompiles;
ALTER TABLE zkvms DROP COLUMN frontend;
ALTER TABLE zkvms RENAME COLUMN dual_licenses TO is_dual_licensed;
ALTER TABLE zkvms ALTER COLUMN repo_url DROP NOT NULL;
ALTER TABLE zkvms ADD COLUMN approved boolean NOT NULL DEFAULT false;
ALTER TABLE zkvms ADD COLUMN updated_at timestamp with time zone DEFAULT now();

UPDATE zkvms SET approved = true;

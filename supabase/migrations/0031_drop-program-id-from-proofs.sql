-- Drop the foreign key constraint on program_id
ALTER TABLE proofs DROP CONSTRAINT IF EXISTS proofs_program_id_programs_id_fk;

-- Drop the program_id column from proofs table
ALTER TABLE proofs DROP COLUMN IF EXISTS program_id;
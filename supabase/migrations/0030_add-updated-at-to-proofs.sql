-- Add updated_at column to proofs table
ALTER TABLE proofs ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Create index on updated_at for query performance
CREATE INDEX IF NOT EXISTS proofs_updated_at_idx ON proofs(updated_at);

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_proofs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function before each update
DROP TRIGGER IF EXISTS proofs_update_updated_at ON proofs;
CREATE TRIGGER proofs_update_updated_at
  BEFORE UPDATE ON proofs
  FOR EACH ROW
  EXECUTE FUNCTION update_proofs_updated_at();
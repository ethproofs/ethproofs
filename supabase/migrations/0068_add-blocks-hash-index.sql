CREATE INDEX IF NOT EXISTS blocks_hash_idx ON blocks (hash) WHERE hash IS NOT NULL;

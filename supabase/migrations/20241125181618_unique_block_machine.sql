ALTER TABLE proofs
ADD CONSTRAINT unique_block_machine UNIQUE (block_number, machine_id);
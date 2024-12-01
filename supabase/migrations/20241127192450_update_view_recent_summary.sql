CREATE OR REPLACE VIEW recent_summary AS
SELECT
  COUNT(DISTINCT b.block_number) AS total_proven_blocks,
  COALESCE(AVG(p.proving_cost), 0) AS avg_cost_per_proof,
  COALESCE(AVG(p.proof_latency), 0) AS avg_proof_latency
FROM
  blocks b
  JOIN proofs p ON b.block_number = p.block_number
WHERE
  b.timestamp >= NOW() - INTERVAL '30 days';
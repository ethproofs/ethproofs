-- Script to randomize timestamps for local development testing
-- Spreads blocks and proofs across the last 90 days

-- Update block timestamps randomly within last 90 days
UPDATE blocks
SET timestamp = (
  NOW() - (random() * INTERVAL '90 days')
)::timestamptz;

-- Update proof timestamps to match their block timestamps
UPDATE proofs p
SET
  proved_timestamp = b.timestamp + (random() * INTERVAL '10 minutes'),
  created_at = b.timestamp - (random() * INTERVAL '5 minutes')
FROM blocks b
WHERE p.block_number = b.block_number
  AND p.proof_status = 'proved';

-- Show distribution across ranges
SELECT
  '7 days' as range,
  COUNT(*) as proofs
FROM proofs p
JOIN blocks b ON p.block_number = b.block_number
WHERE b.timestamp >= NOW() - INTERVAL '7 days'
  AND p.proof_status = 'proved'
UNION ALL
SELECT
  '30 days' as range,
  COUNT(*) as proofs
FROM proofs p
JOIN blocks b ON p.block_number = b.block_number
WHERE b.timestamp >= NOW() - INTERVAL '30 days'
  AND p.proof_status = 'proved'
UNION ALL
SELECT
  '90 days' as range,
  COUNT(*) as proofs
FROM proofs p
JOIN blocks b ON p.block_number = b.block_number
WHERE b.timestamp >= NOW() - INTERVAL '90 days'
  AND p.proof_status = 'proved';

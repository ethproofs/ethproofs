-- Drop unused benchmarks feature tables
-- This feature was never fully implemented and is outdated

-- Drop cluster_benchmarks first (has foreign key to benchmarks)
DROP TABLE IF EXISTS cluster_benchmarks CASCADE;

-- Drop benchmarks table
DROP TABLE IF EXISTS benchmarks CASCADE;
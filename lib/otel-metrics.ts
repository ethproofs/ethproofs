import { metrics } from "@opentelemetry/api"

// Get the meter for creating metrics
const meter = metrics.getMeter("ethproofs")

// Business Metrics

/**
 * Counter for proof submissions by status
 * Labels: status (queued, proving, proved), team_id
 */
export const proofSubmissions = meter.createCounter("proofs.submitted", {
  description: "Total number of proof submissions",
  unit: "1",
})

/**
 * Histogram for proof binary sizes
 * Labels: team_id, status
 */
export const proofSize = meter.createHistogram("proofs.size_bytes", {
  description: "Distribution of proof binary sizes",
  unit: "bytes",
})

/**
 * Counter for blocks processed
 * Labels: team_id, operation (created, updated)
 */
export const blocksProcessed = meter.createCounter("blocks.processed", {
  description: "Total number of blocks processed",
  unit: "1",
})

/**
 * Counter for storage quota exceeded events
 * Labels: team_id
 */
export const storageQuotaExceeded = meter.createCounter("storage.quota_exceeded", {
  description: "Number of times storage quota was exceeded",
  unit: "1",
})

/**
 * Counter for cluster registrations
 * Labels: team_id, is_multi_machine
 */
export const clusterRegistrations = meter.createCounter("clusters.registered", {
  description: "Total number of cluster registrations",
  unit: "1",
})

// Performance Metrics

/**
 * Histogram for block RPC fetch duration
 * Labels: rpc (primary, fallback), success (true, false)
 */
export const blockRpcDuration = meter.createHistogram("blocks.rpc_fetch_duration", {
  description: "Duration of block RPC fetch operations",
  unit: "ms",
})

/**
 * Histogram for proof binary upload duration
 * Labels: team_id, success (true, false)
 */
export const proofUploadDuration = meter.createHistogram("proofs.upload_duration", {
  description: "Duration of proof binary upload operations",
  unit: "ms",
})

/**
 * Counter for authentication failures
 * Labels: none (don't include team_id for security)
 */
export const authFailures = meter.createCounter("auth.failures", {
  description: "Total number of authentication failures",
  unit: "1",
})

/**
 * Counter for database errors
 * Labels: operation, table
 */
export const databaseErrors = meter.createCounter("database.errors", {
  description: "Total number of database errors",
  unit: "1",
})

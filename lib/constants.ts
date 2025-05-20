import type { MetricThresholds } from "./types"

export const SITE_NAME = "Ethproofs"
export const SITE_DESCRIPTION = "Building a fully SNARKed Ethereum"
export const SITE_URL = process.env.SITE_URL || "https://ethproofs.org"
export const SITE_PREVIEW_URL = "https://staging--ethproofs.netlify.app"
export const SITE_REPO = "ethproofs/ethproofs"
export const SITE_TWITTER = "eth_proofs"

export const URL_GITHUB_REPO = new URL(
  SITE_REPO,
  "https://github.com/"
).toString()
export const URL_TWITTER = new URL(SITE_TWITTER, "https://x.com/").toString()

// Beacon chain timing constants
export const BEACON_CHAIN_GENESIS_TIME = 1606824023_000 // 2020-12-01T12:00:23Z
export const MS_PER_SLOT = 12_000
export const SLOTS_PER_EPOCH = 32 // 2^5

// Execution constants
export const BLOCK_GAS_LIMIT = 36_000_000 // TODO: Fetch from execution block

// Prover cluster constants
export const FALLBACK_TEAM_LOGO_SRC =
  "https://ibkqxhjnroghhtfyualc.supabase.co/storage/v1/object/public/public-assets/fallback-team-logo.svg"

export const LEARN_CONTENT_MD = "app/learn/content/index.md"

export const AVERAGE_LABEL = "avg"

export const DEFAULT_PAGE_SIZE = 15
export const DEFAULT_PAGE_INDEX = 0
export const DEFAULT_PAGE_STATE = {
  pageIndex: DEFAULT_PAGE_INDEX,
  pageSize: DEFAULT_PAGE_SIZE,
}

export const isNetlifyProduction = process.env.CONTEXT === "production"

// Supabase storage buckets
export const PROOF_BINARY_BUCKET = "proof_binaries"
export const PUBLIC_ASSETS_BUCKET = "public-assets"

export const CHART_RANGES = [7, 30, 90] as const

export const BENCHMARK_LOWER_THRESHOLD = 45_000 // milliseconds
export const BENCHMARK_UPPER_THRESHOLD = 90_000 // milliseconds

export const ZKVM_THRESHOLDS = {
  size_bytes: {
    red: 512 * 1024, // 512 KiB
    yellow: 32 * 1024, // 32 KiB
    green: 0,
  },
  verification_ms: {
    red: 16, // 16ms
    yellow: 1, // 1ms
    green: 0,
  },
  security_target_bits: {
    red: 100,
    yellow: 128,
    green: Number.MAX_SAFE_INTEGER,
  },
  max_bounty_amount: {
    red: 64000, // $64k
    yellow: 1000000, // $1M
    green: Number.MAX_SAFE_INTEGER,
  },
} as const satisfies Record<string, MetricThresholds>

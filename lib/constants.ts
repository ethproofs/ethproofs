export const SITE_NAME = "Ethproofs"
export const SITE_DESCRIPTION = "Building a fully SNARKed Ethereum"
export const SITE_URL = process.env.SITE_URL || "https://ethproofs.org"
export const SITE_PREVIEW_URL = "http://ethproofs.netlify.app"
export const SITE_REPO_URL = "https://github.com/ethproofs/ethproofs"

// Beacon chain timing constants
export const BEACON_CHAIN_GENESIS_TIME = 1606824023_000 // 2020-12-01T12:00:23Z
export const MS_PER_SLOT = 12_000
export const SLOTS_PER_EPOCH = 32 // 2^5

// Execution constants
export const BLOCK_GAS_LIMIT = 30_000_000 // TODO: Fetch from execution block

// Prover machine constants
export const FALLBACK_TEAM_LOGO_SRC =
  "https://ibkqxhjnroghhtfyualc.supabase.co/storage/v1/object/public/public-assets/fallback-team-logo.svg"

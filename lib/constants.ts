export const SITE_NAME = "Ethproofs"
export const SITE_DESCRIPTION = "Building a fully SNARKed Ethereum"
export const SITE_URL = process.env.SITE_URL || "https://ethproofs.org"
export const SITE_PREVIEW_URL = "https://staging--ethproofs.netlify.app"
export const SITE_REPO = "ethproofs/ethproofs"

// Beacon chain timing constants
export const BEACON_CHAIN_GENESIS_TIME = 1606824023_000 // 2020-12-01T12:00:23Z
export const MS_PER_SLOT = 12_000
export const SLOTS_PER_EPOCH = 32 // 2^5

// Execution constants
export const BLOCK_GAS_LIMIT = 30_000_000 // TODO: Fetch from execution block

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

export const SITE_NAME = "EthProofs"
export const SITE_DESCRIPTION = "Building a fully SNARKed Ethereum"
export const SITE_URL = "https://ethproofs.org"
export const SITE_PREVIEW_URL = "http://ethproofs.netlify.app"
export const SITE_REPO_URL = "https://github.com/ethproofs/ethproofs"

// Beacon chain timing constants
const BEACON_CHAIN_GENESIS = "2020-12-01T12:00:23Z"
export const BEACON_CHAIN_GENESIS_TIME = new Date(
  BEACON_CHAIN_GENESIS
).getTime()
export const MS_PER_SLOT = 12_000
export const SLOTS_PER_EPOCH = 32 // 2^5

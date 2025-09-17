import { createPublicClient, fallback, http } from "viem"
import { mainnet } from "viem/chains"

import { Block, Team } from "./types"

const rpcUrl = process.env.RPC_URL
const rpcUrlFallback = process.env.RPC_URL_FALLBACK

export const client = createPublicClient({
  chain: mainnet,
  transport: fallback([
    http(rpcUrl, {
      timeout: 5000,
      retryCount: 2,
    }),
    http(rpcUrlFallback, {
      timeout: 5000,
      retryCount: 2,
    }),
  ]),
})

type BlockSummary = {
  gasUsed: bigint
  txsCount: number
  timestamp: bigint
  hash: string
}

/**
 * Fetch a block using multiple RPCs with built-in retries and timeout.
 *
 * @param blockNumber - Block number to fetch
 */
export async function fetchBlockData(
  blockNumber: number
): Promise<BlockSummary> {
  const block = await client.getBlock({
    blockNumber: BigInt(blockNumber),
    includeTransactions: false,
  })
  return {
    gasUsed: block.gasUsed,
    hash: block.hash,
    txsCount: block.transactions.length,
    timestamp: block.timestamp,
  }
}

/**
 * Determines the type of value for a given block.
 *
 * @param block - The block parameter to evaluate in string format
 * @returns null if not parsable to a number; "hash" if matching 64 hex chars, else "block_number"
 */
export const getBlockValueType = (
  block: string
): keyof Pick<Block, "hash" | "block_number"> | null => {
  if (isNaN(+block)) return null

  if (isBlockHash(block)) return "hash"

  return "block_number"
}

export const isBlockHash = (block: string) => {
  return /^0x[0-9a-fA-F]{64}$/.test(block)
}

export const mergeBlocksWithTeams = (blocks: Block[], teams: Team[]) => {
  return blocks.map((block) => {
    const { proofs } = block
    const proofsWithTeams = proofs.map((proof) => ({
      ...proof,
      team: teams.find((team) => team.id === proof.team_id),
    }))

    return { ...block, proofs: proofsWithTeams }
  })
}

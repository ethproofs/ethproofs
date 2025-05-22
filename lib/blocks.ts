import { createPublicClient, http } from "viem"
import { mainnet } from "viem/chains"

import { Block, Team } from "./types"

const rpcUrl = process.env.RPC_URL

const client = createPublicClient({
  chain: mainnet,
  transport: http(rpcUrl),
})

export const fetchBlockData = async (block_number: number) => {
  const block = await client.getBlock({
    blockNumber: BigInt(block_number),
    includeTransactions: true,
  })

  return {
    gasUsed: block.gasUsed,
    txsCount: block.transactions.length,
    timestamp: block.timestamp,
    hash: block.hash,
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

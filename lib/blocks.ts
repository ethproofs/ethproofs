import { createPublicClient, http } from "viem"
import { mainnet } from "viem/chains"

import { Block, Team } from "./types"

const rpcUrl = process.env.RPC_URL

const client = createPublicClient({
  chain: mainnet,
  transport: http(rpcUrl),
})

export const fetchBlockData = async (block_number: number, maxRetries = 3) => {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
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
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(
        `Attempt ${attempt}/${maxRetries} failed for block ${block_number}:`,
        lastError.message
      )

      // Don't retry on final attempt
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw new Error(
    `Failed to fetch block ${block_number} after ${maxRetries} attempts: ${lastError?.message}`
  )
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
  if (isBlockHash(block)) return "hash"

  if (!isNaN(+block)) return "block_number"

  return null
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

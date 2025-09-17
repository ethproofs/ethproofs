import { createPublicClient, http } from "viem"
import { mainnet } from "viem/chains"

import { Block, Team } from "./types"
import { delay } from "@/utils/delay"

const rpcUrl = process.env.RPC_URL
const rpcUrlFallback = process.env.RPC_URL_FALLBACK

const client = createPublicClient({
  chain: mainnet,
  transport: http(rpcUrl),
})

const clientFallback = createPublicClient({
  chain: mainnet,
  transport: http(rpcUrlFallback),
})

type BlockSummary = {
  gasUsed: bigint
  txsCount: number
  timestamp: bigint
  hash: string
}

/**
 * Fetch a block with retries, exponential backoff + jitter, and per-attempt timeout.
 *
 * @param block_number - Block number to fetch
 * @param maxRetries - Number of attempts (default 3)
 * @param attemptTimeoutMs - Per-attempt timeout in ms (default 5000)
 */
export async function fetchBlockData(
  block_number: number,
  maxRetries = 3,
  attemptTimeoutMs = 5000
): Promise<BlockSummary> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), attemptTimeoutMs)

    try {
      const block = await client.getBlock({
        blockNumber: BigInt(block_number),
        includeTransactions: true,
        // @ts-expect-error: signal is supported at runtime
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      return {
        gasUsed: block.gasUsed,
        hash: block.hash,
        txsCount: block.transactions.length,
        timestamp: block.timestamp,
      }
    } catch (error) {
      clearTimeout(timeoutId)

      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(
        `Attempt ${attempt}/${maxRetries} failed for block ${block_number}:`,
        lastError.message
      )

      // Stop retrying on final attempt
      if (attempt < maxRetries) {
        const baseDelay = Math.pow(2, attempt - 1) * 1000
        const jitter = Math.random() * 300
        await delay(baseDelay + jitter)
      }
    }
  }

  throw new Error(
    `Failed to fetch block ${block_number} after ${maxRetries} attempts: ${lastError?.message}`
  )
}

/**
 * Fallback fetch for a block with retries, exponential backoff + jitter, and per-attempt timeout.
 *
 * @param block_number - Block number to fetch
 * @param maxRetries - Number of attempts (default 3)
 * @param attemptTimeoutMs - Per-attempt timeout in ms (default 5000)
 */
export async function fetchBlockDataFallback(
  block_number: number,
  maxRetries = 3,
  attemptTimeoutMs = 5000
): Promise<BlockSummary> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), attemptTimeoutMs)

    try {
      const block = await clientFallback.getBlock({
        blockNumber: BigInt(block_number),
        includeTransactions: true,
        // @ts-expect-error: signal is supported at runtime
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      return {
        gasUsed: block.gasUsed,
        hash: block.hash,
        txsCount: block.transactions.length,
        timestamp: block.timestamp,
      }
    } catch (error) {
      clearTimeout(timeoutId)

      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(
        `Fallback attempt ${attempt}/${maxRetries} failed for block ${block_number}:`,
        lastError.message
      )

      // Stop retrying on final attempt
      if (attempt < maxRetries) {
        const baseDelay = Math.pow(2, attempt - 1) * 1000
        const jitter = Math.random() * 300
        await delay(baseDelay + jitter)
      }
    }
  }

  throw new Error(
    `Fallback failed to fetch block ${block_number} after ${maxRetries} attempts: ${lastError?.message}`
  )
}

/**
 * Fetch block data with automatic fallback RPC.
 *
 * @param block_number - Block number to fetch
 * @param maxRetries - Number of attempts per RPC (default 3)
 * @param attemptTimeoutMs - Per-attempt timeout in ms (default 5000)
 */
export async function fetchBlockDataWithFallback(
  block_number: number,
  maxRetries = 3,
  attemptTimeoutMs = 5000
): Promise<BlockSummary> {
  try {
    return await fetchBlockData(block_number, maxRetries, attemptTimeoutMs)
  } catch (primaryError) {
    const primaryErr =
      primaryError instanceof Error
        ? primaryError
        : new Error(String(primaryError))
    console.warn(
      `Primary RPC failed for block ${block_number}, trying fallback:`,
      primaryErr
    )
    try {
      return await fetchBlockDataFallback(
        block_number,
        maxRetries,
        attemptTimeoutMs
      )
    } catch (fallbackError) {
      const fallbackErr =
        fallbackError instanceof Error
          ? fallbackError
          : new Error(String(fallbackError))
      throw new Error(
        `Both primary and fallback RPC failed for block ${block_number}. Primary: ${primaryErr.message}, Fallback: ${fallbackErr.message}`
      )
    }
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

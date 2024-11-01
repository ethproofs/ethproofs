import { type Block as ViemBlock, createPublicClient, http } from "viem"
import { mainnet } from "viem/chains"

import type { Block, BlockWithProofsId, Proof } from "@/lib/types"

import { timestampWithinDays } from "./date"

const client = createPublicClient({
  chain: mainnet,
  // TODO use custom rpc endpoint
  transport: http(),
})

function calculateTotalFees(block: ViemBlock<bigint, true>): bigint {
  let totalFees = BigInt(0)

  for (const tx of block.transactions) {
    const gasUsed = BigInt(tx.gas)
    const maxFeePerGas = BigInt(tx.maxFeePerGas || 0)
    const maxPriorityFeePerGas = BigInt(tx.maxPriorityFeePerGas || 0)

    if (!block.baseFeePerGas) {
      throw new Error("Base fee per gas is not available")
    }

    // Calculate effective gas price
    const effectiveGasPrice =
      maxFeePerGas < block.baseFeePerGas + maxPriorityFeePerGas
        ? maxFeePerGas
        : block.baseFeePerGas + maxPriorityFeePerGas

    // Calculate transaction fee
    const transactionFee = gasUsed * effectiveGasPrice
    totalFees += transactionFee
  }

  return totalFees
}

export const fetchBlockData = async (block_number: number) => {
  const block = await client.getBlock({
    blockNumber: BigInt(block_number),
    includeTransactions: true,
  })

  return {
    feeTotal: calculateTotalFees(block),
    gasUsed: block.gasUsed,
    txsCount: block.transactions.length,
    timestamp: block.timestamp,
    hash: block.hash,
  }
}

/**
 * Determines if a block is recent based on its timestamp.
 *
 * @param {Block | BlockWithProofsId} param0 - The block object containing a timestamp.
 * @returns {boolean} - Returns `true` if the block's timestamp is within a certain number of days, otherwise `false`.
 */
const blockIsRecent = ({ timestamp }: Block | BlockWithProofsId): boolean =>
  timestampWithinDays(timestamp)

/**
 * Checks if a given block has at least one proof that matches any proof in the provided list of proofs.
 *
 * @param block - The block to check, which includes an array of proofs with IDs.
 * @param allProofs - The list of all proofs to compare against.
 * @returns `true` if the block has at least one matching proof, otherwise `false`.
 */
const blockIsProven = (block: BlockWithProofsId, allProofs: Proof[]) =>
  block.proofs.some(({ id }) => allProofs.find((p) => p.proof_id === id))

/**
 * Filters the given blocks to return only those that are recent and have been proven.
 *
 * @param blocks - An array of blocks with proof IDs.
 * @param proofs - An array of proofs.
 * @returns An array of blocks that are both recent and proven.
 */
const blocksProvenRecent = (
  blocks: BlockWithProofsId[],
  proofs: Proof[]
): Block[] =>
  blocks.filter(blockIsRecent).filter((block) => blockIsProven(block, proofs))

/**
 * Calculates the total number of recently proven blocks.
 *
 * @param blocks - An array of blocks with proof IDs.
 * @param proofs - An array of proofs.
 * @returns The total number of recently proven blocks.
 */
export const totalBlocksProvenRecent = (
  blocks: BlockWithProofsId[],
  proofs: Proof[]
): number => blocksProvenRecent(blocks, proofs).length

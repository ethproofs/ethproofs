import { type Block as ViemBlock, createPublicClient, http } from "viem"
import { mainnet } from "viem/chains"

const rpcUrl = process.env.RPC_URL

const client = createPublicClient({
  chain: mainnet,
  transport: http(rpcUrl),
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
 * Determines the type of value for a given block.
 *
 * @param block - The block parameter to evaluate.
 * @returns A string indicating the type of value: "hash" if the block number is greater than 0xffffffff, otherwise "block_number".
 */
export const getBlockValueType = (block: number) =>
  block > 0xffffffff ? "hash" : "block_number"

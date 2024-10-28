import { createPublicClient, http, type Block } from "viem"
import { mainnet } from "viem/chains"

const client = createPublicClient({
  chain: mainnet,
  // TODO use custom rpc endpoint
  transport: http(),
})

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
  }
}

function calculateTotalFees(block: Block<bigint, true>): bigint {
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

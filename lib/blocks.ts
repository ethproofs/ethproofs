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
 * @param block - The block parameter to evaluate.
 * @returns A string indicating the type of value: "hash" if the block number is greater than 0xffffffff, otherwise "block_number".
 */
export const getBlockValueType = (block: number) =>
  block > 0xffffffff ? "hash" : "block_number"

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

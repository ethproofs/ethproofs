import { createPublicClient, http } from "viem"
import { mainnet } from "viem/chains"
import { PaginationState } from "@tanstack/react-table"

import { Block, Team } from "./types"

import { db } from "@/db"
import { blocks } from "@/db/schema"

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

export const fetchBlocksPaginated = async (pagination: PaginationState) => {
  const blocksRows = await db.query.blocks.findMany({
    with: {
      proofs: {
        with: {
          cluster: {
            with: {
              cluster_configuration: {
                with: {
                  aws_instance_pricing: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: (blocks, { desc }) => [desc(blocks.block_number)],
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
    extras: {
      rowCount: db.$count(blocks).as("count"),
    },
  })

  return {
    rows: blocksRows,
    rowCount: blocksRows[0].rowCount,
  }
}

export const mergeBlocksWithTeams = (blocks: Block[], teams: Team[]) => {
  return blocks.map((block) => {
    const { proofs } = block
    const proofsWithTeams = proofs.map((proof) => ({
      ...proof,
      team: teams.find((team) => team.user_id === proof.user_id),
    }))

    return { ...block, proofs: proofsWithTeams }
  })
}

import { createPublicClient, http } from "viem"
import { mainnet } from "viem/chains"
import { PaginationState } from "@tanstack/react-table"

import { Block, Team } from "./types"

import { createClient } from "@/utils/supabase/client"

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
  const client = createClient()

  const blocks = await client
    .from("blocks")
    .select(
      `*,
      proofs!inner(
        id:proof_id,
        proof_id,
        block_number,
        cluster_id,
        created_at,
        program_id,
        proof_status,
        proving_cycles,
        proving_time,
        queued_timestamp,
        proving_timestamp,
        proved_timestamp,
        size_bytes,
        user_id,
        cluster:clusters(*,
          cluster_configurations(*,
            aws_instance_pricing(*)
          )
        )
      )`
    )
    .order("block_number", { ascending: false })
    .range(
      pagination.pageIndex * pagination.pageSize,
      (pagination.pageIndex + 1) * pagination.pageSize - 1
    )

  const { count } = await client
    .from("blocks")
    .select("*", { count: "exact", head: true })

  return {
    rows: blocks.data,
    rowCount: count,
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

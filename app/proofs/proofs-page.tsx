"use client"

import { useEffect, useState } from "react"

import { createClient } from "@/utils/supabase/client"
import ProofsTable from "@/components/ProofsTable"

import type { BlockWithProofs, Proof } from "@/lib/types"

type Props = {
  blocks: BlockWithProofs[]
}

const ProofsPage = ({ blocks }: Props) => {
  const [data, setData] = useState(blocks)

  const supabase = createClient()

  useEffect(() => {
    const blocksChannel = supabase
      .channel("blocks")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "blocks" },
        (payload) => {
          setData([payload.new as BlockWithProofs, ...data])
        }
      )
      .subscribe()

    const proofsChannel = supabase
      .channel("proofs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "proofs" },
        (payload) => {
          const proof = payload.new as Proof
          const blockIndex = data.findIndex(
            (block) => block.block_number === proof.block_number
          )

          if (blockIndex < 0) {
            console.error(`Block ${proof.block_number} not found`)
            return
          }

          const block = data[blockIndex]
          const newBlock = { ...block, proofs: [...block.proofs, proof] }

          setData([
            ...data.slice(0, blockIndex),
            newBlock,
            ...data.slice(blockIndex + 1),
          ])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(blocksChannel)
      supabase.removeChannel(proofsChannel)
    }
  }, [data, setData])

  return <ProofsTable className="mx-auto my-8 max-w-screen-lg" blocks={data} />
}

export default ProofsPage

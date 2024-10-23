"use client"

import { Reducer, useEffect, useReducer } from "react"

import { createClient } from "@/utils/supabase/client"
import ProofsTable from "@/components/ProofsTable"

import type { Block, Proof } from "@/lib/types"
import { Actions, State, createInitialState, reducer } from "./reducer"

type Props = {
  blocks: (Block & { proofs: { id: number }[] })[]
  proofs: Proof[]
}

const ProofsPage = ({ blocks, proofs }: Props) => {
  const [state, dispatch] = useReducer<
    Reducer<State, Actions>,
    { blocks: (Block & { proofs: { id: number }[] })[]; proofs: Proof[] }
  >(reducer, { blocks, proofs }, createInitialState)

  const supabase = createClient()

  useEffect(() => {
    const blocksChannel = supabase
      .channel("blocks")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "blocks" },
        (payload) => {
          dispatch({ type: "add_block", payload: payload.new as Block })
        }
      )
      .subscribe()

    const proofsChannel = supabase
      .channel("proofs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "proofs" },
        (payload) => {
          dispatch({ type: "add_proof", payload: payload.new as Proof })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(blocksChannel)
      supabase.removeChannel(proofsChannel)
    }
  }, [state])

  const blocksWithProofs = state.blocks.allIds
    .map((id) => state.blocks.byId[id])
    .map((block) => ({
      ...block,
      proofs: block.proofs.map((id) => state.proofs.byId[id]),
    }))

  return (
    <ProofsTable
      className="mx-auto my-8 max-w-screen-lg"
      blocks={blocksWithProofs}
    />
  )
}

export default ProofsPage
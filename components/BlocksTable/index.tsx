"use client"

import { Reducer, useEffect, useReducer } from "react"

import type { Block, BlockBase, Proof } from "@/lib/types"

import DataTable from "@/components/ui/data-table"

import { columns } from "./columns"
import { Actions, createInitialState, reducer, State } from "./reducer"

import { createClient } from "@/utils/supabase/client"

type Props = {
  blocks: Block[]
  className?: string
}

const BlocksTable = ({ blocks, className }: Props) => {
  const [state, dispatch] = useReducer<
    Reducer<State, Actions>,
    { blocks: Block[] }
  >(reducer, { blocks }, createInitialState)

  const supabase = createClient()

  useEffect(() => {
    const blocksChannel = supabase
      .channel("blocks")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "blocks" },
        (payload) => {
          dispatch({ type: "add_block", payload: payload.new as BlockBase })
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "blocks" },
        (payload) => {
          dispatch({ type: "update_block", payload: payload.new as BlockBase })
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
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "proofs" },
        (payload) => {
          dispatch({ type: "update_proof", payload: payload.new as Proof })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(blocksChannel)
      supabase.removeChannel(proofsChannel)
    }
  }, [state, supabase])

  const blockData = state.allIds.map((id) => state.byId[id])

  return (
    <DataTable
      className={className}
      columns={columns}
      data={blockData}
      sorting={[{ id: "block_number", desc: true }]}
    />
  )
}

export default BlocksTable

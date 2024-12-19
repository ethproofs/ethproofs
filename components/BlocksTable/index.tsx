"use client"

import { useEffect, useMemo, useState } from "react"
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { Team } from "@/lib/types"

import DataTableControlled from "../ui/data-table-controlled"

import { columns } from "./columns"

import { fetchBlocksPaginated, mergeBlocksWithTeams } from "@/lib/blocks"
import { createClient } from "@/utils/supabase/client"

type Props = {
  className?: string
  teams: Team[]
}

const BlocksTable = ({ className, teams }: Props) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  })

  const blocksQuery = useQuery({
    queryKey: ["blocks", pagination],
    queryFn: async () => {
      const blocks = await fetchBlocksPaginated(pagination)
      return {
        ...blocks,
        rows: mergeBlocksWithTeams(blocks.rows ?? [], teams),
      }
    },
    placeholderData: keepPreviousData,
  })

  const queryClient = useQueryClient()

  const supabase = createClient()

  useEffect(() => {
    const blocksChannel = supabase
      .channel("blocks")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "blocks" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["blocks"] })
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "blocks" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["blocks"] })
        }
      )
      .subscribe()

    const proofsChannel = supabase
      .channel("proofs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "proofs" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["blocks"] })
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "proofs" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["blocks"] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(blocksChannel)
      supabase.removeChannel(proofsChannel)
    }
  }, [queryClient, supabase])

  const defaultData = useMemo(() => [], [])

  return (
    <DataTableControlled
      className={className}
      columns={columns}
      data={blocksQuery.data?.rows ?? defaultData}
      rowCount={blocksQuery.data?.rowCount ?? 0}
      pagination={pagination}
      setPagination={setPagination}
    />
  )
}

export default BlocksTable

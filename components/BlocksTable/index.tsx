"use client"

import { useMemo, useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { Team } from "@/lib/types"

import DataTableControlled from "../ui/data-table-controlled"

import { columns } from "./columns"
import useRealtimeUpdates from "./useRealtimeUpdates"

import { fetchBlocksPaginated, mergeBlocksWithTeams } from "@/lib/blocks"

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

  useRealtimeUpdates()

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

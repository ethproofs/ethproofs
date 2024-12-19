"use client"

import { useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { Team } from "@/lib/types"

import { DEFAULT_PAGE_STATE } from "@/lib/constants"

import DataTableControlled from "../ui/data-table-controlled"

import { columns } from "./columns"
import useRealtimeUpdates from "./useRealtimeUpdates"

import { fetchBlocksPaginated, mergeBlocksWithTeams } from "@/lib/blocks"

type Props = {
  className?: string
  teams: Team[]
}

const BlocksTable = ({ className, teams }: Props) => {
  const [pagination, setPagination] =
    useState<PaginationState>(DEFAULT_PAGE_STATE)

  const blocksQuery = useQuery({
    queryKey: ["blocks", pagination],
    queryFn: () => fetchBlocksPaginated(pagination),
    placeholderData: keepPreviousData,
  })

  useRealtimeUpdates()

  const blocks = mergeBlocksWithTeams(blocksQuery.data?.rows ?? [], teams)

  return (
    <DataTableControlled
      className={className}
      columns={columns}
      data={blocks}
      rowCount={blocksQuery.data?.rowCount ?? 0}
      pagination={pagination}
      setPagination={setPagination}
    />
  )
}

export default BlocksTable

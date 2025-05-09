"use client"

import { useState } from "react"
import { useDebounceValue } from "usehooks-ts"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import type { Block, Team } from "@/lib/types"

import { DEFAULT_PAGE_STATE } from "@/lib/constants"

import DataTableControlled from "../ui/data-table-controlled"

import { columns } from "./columns"
import useRealtimeUpdates from "./useRealtimeUpdates"

import { MachineType } from "@/lib/api/blocks"
import { mergeBlocksWithTeams } from "@/lib/blocks"

type Props = {
  className?: string
  teams: Team[]
  machineType: MachineType
}

const BlocksTable = ({ className, teams, machineType }: Props) => {
  const [pagination, setPagination] =
    useState<PaginationState>(DEFAULT_PAGE_STATE)
  const [deferredPagination] = useDebounceValue(pagination, 200)

  const blocksQuery = useQuery<{ rows: Block[]; rowCount: number }>({
    queryKey: ["blocks", machineType, deferredPagination],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set("page_index", deferredPagination.pageIndex.toString())
      params.set("page_size", deferredPagination.pageSize.toString())
      params.set("machine_type", machineType)
      const response = await fetch(`/api/blocks?${params.toString()}`)
      return response.json()
    },
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

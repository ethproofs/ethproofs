"use client"

import { useDebounceValue } from "usehooks-ts"
import {
  keepPreviousData,
  usePrefetchQuery,
  useQuery,
} from "@tanstack/react-query"

import type { Block, Team } from "@/lib/types"

import { useDataTableUrlState } from "@/components/data-table/useDataTableUrlState"

import { DataTable } from "../data-table/data-table"

import { columns, labels } from "./columns"
import useRealtimeUpdates from "./useRealtimeUpdates"

import { MachineType } from "@/lib/api/blocks"
import { mergeBlocksWithTeams } from "@/lib/blocks"
import { exportWithLabels } from "@/lib/csv-export"

const getBlocksQueryKey = (
  pageIndex: number,
  pageSize: number,
  machineType: MachineType
) => ["blocks", machineType, { pageIndex, pageSize }]

const getBlocksQueryFn =
  (pageIndex: number, pageSize: number, machineType: MachineType) =>
  async () => {
    const params = new URLSearchParams()
    params.set("page_index", pageIndex.toString())
    params.set("page_size", pageSize.toString())
    params.set("machine_type", machineType)
    const response = await fetch(`/api/blocks?${params.toString()}`)
    return response.json()
  }

interface BlocksTableProps {
  className?: string
  machineType: MachineType
  teams: Team[]
}

export function BlocksTable({
  className,
  teams,
  machineType,
}: BlocksTableProps) {
  const tableState = useDataTableUrlState()
  const [deferredPagination] = useDebounceValue(tableState.pagination, 200)

  const { pageIndex, pageSize } = deferredPagination

  const queryKey = getBlocksQueryKey(pageIndex, pageSize, machineType)

  const blocksQuery = useQuery<{ rows: Block[]; rowCount: number }>({
    queryKey,
    queryFn: getBlocksQueryFn(pageIndex, pageSize, machineType),
    placeholderData: keepPreviousData,
  })

  useRealtimeUpdates()

  // Prefetch next page
  usePrefetchQuery({
    queryKey: getBlocksQueryKey(pageIndex + 1, pageSize, machineType),
    queryFn: getBlocksQueryFn(pageIndex + 1, pageSize, machineType),
  })

  // Prefetch previous page (noop if on first page)
  usePrefetchQuery({
    queryKey: getBlocksQueryKey(pageIndex - 1, pageSize, machineType),
    queryFn:
      pageIndex > 0
        ? getBlocksQueryFn(pageIndex - 1, pageSize, machineType)
        : async () => Promise.resolve(null),
  })

  const blocks = mergeBlocksWithTeams(blocksQuery.data?.rows ?? [], teams)

  const handleExport = (rows: Block[], isFiltered: boolean) => {
    const filename = `blocks-${new Date().toISOString().split("T")[0]}${
      isFiltered ? "-filtered" : "-all"
    }`
    exportWithLabels(rows, labels, filename)
  }

  return (
    <DataTable
      className={className}
      data={blocks}
      columns={columns}
      rowCount={blocksQuery.data?.rowCount ?? 0}
      columnLabels={labels}
      onExport={handleExport}
      toolbarFilterColumnId="block_number"
      toolbarFilterPlaceholder="filter by block number..."
      {...tableState}
    />
  )
}

"use client"

import { useDebounceValue } from "usehooks-ts"
import { usePrefetchQuery } from "@tanstack/react-query"

import type { Block, Team } from "@/lib/types"

import { useDataTableUrlState } from "@/components/data-table/useDataTableUrlState"
import {
  getBlocksQueryFn,
  getBlocksQueryKey,
  useBlocksQuery,
} from "@/components/hooks/use-blocks-query"

import { DataTable } from "../data-table/data-table"
import { Spinner } from "../ui/spinner"

import { columns, labels } from "./columns"

import type { MachineType } from "@/lib/api/blocks"
import { mergeBlocksWithTeams } from "@/lib/blocks"
import { exportWithLabels } from "@/lib/csv-export"

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

  const blocksQuery = useBlocksQuery({
    pageIndex,
    pageSize,
    machineType,
    keepPreviousData: true,
  })

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

  if (blocksQuery.isLoading) {
    return (
      <div className="mt-4 flex items-center gap-2 px-6">
        <Spinner className="text-muted-foreground" />
        <p className="text-muted-foreground">loading proofs...</p>
      </div>
    )
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

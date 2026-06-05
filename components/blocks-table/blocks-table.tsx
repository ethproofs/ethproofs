"use client"

import { useMemo } from "react"
import { useDebounceValue } from "usehooks-ts"
import { usePrefetchQuery } from "@tanstack/react-query"

import type { Block, Team } from "@/lib/types"

import { useDataTableUrlState } from "@/components/data-table/useDataTableUrlState"

import { cn } from "@/lib/utils"

import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from "@/lib/constants"

import { DataTable } from "../data-table/data-table"

import { getColumns, labels } from "./columns"

import type { MachineType } from "@/lib/api/blocks"
import { mergeBlocksWithTeams } from "@/lib/blocks"
import { exportWithLabels } from "@/lib/csv-export"
import {
  type BlocksQueryResult,
  getBlocksQueryFn,
  getBlocksQueryKey,
  useBlocksQuery,
} from "@/lib/hooks/queries/use-blocks-query"
import useRealtimeBlockProofs from "@/lib/hooks/realtime/use-realtime-block-proofs"

interface BlocksTableProps {
  className?: string
  machineType: MachineType
  teams: Team[]
  onOpenDrawer?: (block: Block) => void
  initialData?: BlocksQueryResult
  otherTabMachineType?: MachineType
}

export function BlocksTable({
  className,
  teams,
  machineType,
  onOpenDrawer,
  initialData,
  otherTabMachineType,
}: BlocksTableProps) {
  useRealtimeBlockProofs()
  const tableState = useDataTableUrlState()
  const [deferredPagination] = useDebounceValue(tableState.pagination, 200)
  const { pageIndex, pageSize } = deferredPagination

  const isInitialPage =
    pageIndex === DEFAULT_PAGE_INDEX && pageSize === DEFAULT_PAGE_SIZE

  const blocksQuery = useBlocksQuery({
    pageIndex,
    pageSize,
    machineType,
    keepPreviousData: true,
    initialData: isInitialPage ? initialData : undefined,
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

  // Prefetch the other machineType's first page so tab switches feel instant
  usePrefetchQuery({
    queryKey: otherTabMachineType
      ? getBlocksQueryKey(
          DEFAULT_PAGE_INDEX,
          DEFAULT_PAGE_SIZE,
          otherTabMachineType
        )
      : ["blocks", "noop"],
    queryFn: otherTabMachineType
      ? getBlocksQueryFn(
          DEFAULT_PAGE_INDEX,
          DEFAULT_PAGE_SIZE,
          otherTabMachineType
        )
      : async () => Promise.resolve(null),
  })

  const blocks = mergeBlocksWithTeams(blocksQuery.data?.rows ?? [], teams)

  const columns = useMemo(() => getColumns({ onOpenDrawer }), [onOpenDrawer])

  const handleExport = (rows: Block[], isFiltered: boolean) => {
    const filename = `blocks-${new Date().toISOString().split("T")[0]}${
      isFiltered ? "-filtered" : "-all"
    }`
    exportWithLabels(rows, labels, filename)
  }

  return (
    <DataTable
      className={cn("[&>div]:max-h-none", className)}
      data={blocks}
      columns={columns}
      rowCount={blocksQuery.data?.rowCount ?? 0}
      columnLabels={labels}
      onExport={handleExport}
      toolbarFilterColumnId="block_number"
      toolbarFilterPlaceholder="filter by block number..."
      isLoading={blocksQuery.isPending || blocksQuery.isPlaceholderData}
      {...tableState}
    />
  )
}

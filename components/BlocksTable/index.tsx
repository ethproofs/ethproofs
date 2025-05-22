"use client"

import { useState } from "react"
import { useDebounceValue } from "usehooks-ts"
import {
  keepPreviousData,
  usePrefetchQuery,
  useQuery,
} from "@tanstack/react-query"
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

const BlocksTable = ({ className, teams, machineType }: Props) => {
  const [pagination, setPagination] =
    useState<PaginationState>(DEFAULT_PAGE_STATE)
  const [deferredPagination] = useDebounceValue(pagination, 200)

  const { pageIndex, pageSize } = deferredPagination

  const blocksQuery = useQuery<{ rows: Block[]; rowCount: number }>({
    queryKey: getBlocksQueryKey(pageIndex, pageSize, machineType),
    queryFn: getBlocksQueryFn(pageIndex, pageSize, machineType),
    placeholderData: keepPreviousData,
  })

  useRealtimeUpdates()

  // Prefetch next page
  usePrefetchQuery({
    queryKey: getBlocksQueryKey(pageIndex + 1, pageSize, machineType),
    queryFn: getBlocksQueryFn(pageIndex + 1, pageSize, machineType),
  })

  // Prefetch previous page (no-op if on first page)
  usePrefetchQuery({
    queryKey: getBlocksQueryKey(pageIndex - 1, pageSize, machineType),
    queryFn:
      pageIndex > 0
        ? getBlocksQueryFn(pageIndex - 1, pageSize, machineType)
        : async () => Promise.resolve(null),
  })

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

"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import type { Block } from "@/lib/types"

import { type MachineType } from "@/lib/api/blocks"

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

export interface BlocksQueryResult {
  rows: Block[]
  rowCount: number
}

interface UseBlocksQueryOptions {
  pageIndex?: number
  pageSize?: number
  machineType?: MachineType
  keepPreviousData?: boolean
}

export function useBlocksQuery({
  pageIndex = 0,
  pageSize = 10,
  machineType = "all",
  keepPreviousData: keepPrevious = false,
}: UseBlocksQueryOptions = {}) {
  return useQuery<BlocksQueryResult>({
    queryKey: getBlocksQueryKey(pageIndex, pageSize, machineType),
    queryFn: getBlocksQueryFn(pageIndex, pageSize, machineType),
    placeholderData: keepPrevious ? keepPreviousData : undefined,
    staleTime: Infinity, // Data is kept fresh by realtime subscriptions
  })
}

export { getBlocksQueryFn, getBlocksQueryKey }

"use client"

import { useDebounceValue } from "usehooks-ts"
import {
  keepPreviousData,
  usePrefetchQuery,
  useQuery,
} from "@tanstack/react-query"

import { useDataTableUrlState } from "@/components/data-table/useDataTableUrlState"

import type { ProofRow } from "./columns"

type FilterType = "all" | "single" | "multi"

const getBlockProofsQueryKey = (
  blockId: string,
  pageIndex: number,
  pageSize: number,
  filterType: FilterType
) => ["block-proofs", blockId, filterType, { pageIndex, pageSize }]

const getBlockProofsQueryFn =
  (
    blockId: string,
    pageIndex: number,
    pageSize: number,
    filterType: FilterType
  ) =>
  async () => {
    const params = new URLSearchParams()
    params.set("page_index", pageIndex.toString())
    params.set("page_size", pageSize.toString())
    params.set("filter_type", filterType)
    const response = await fetch(
      `/api/blocks/${blockId}/proofs?${params.toString()}`
    )
    return response.json()
  }

interface UseBlockProofsOptions {
  filterType?: FilterType
}

export function useBlockProofs(
  blockId: string,
  options: UseBlockProofsOptions = {}
) {
  const { filterType = "all" } = options

  const tableState = useDataTableUrlState({
    initialVisibility: {
      block_number: false,
    },
  })
  const [deferredPagination] = useDebounceValue(tableState.pagination, 200)
  const { pageIndex, pageSize } = deferredPagination

  const queryKey = getBlockProofsQueryKey(
    blockId,
    pageIndex,
    pageSize,
    filterType
  )

  const proofsQuery = useQuery<{
    rows: (ProofRow & {
      block_number: number
      block_timestamp?: string | null
    })[]
    rowCount: number
  }>({
    queryKey,
    queryFn: getBlockProofsQueryFn(blockId, pageIndex, pageSize, filterType),
    placeholderData: keepPreviousData,
  })

  // Prefetch next page
  usePrefetchQuery({
    queryKey: getBlockProofsQueryKey(
      blockId,
      pageIndex + 1,
      pageSize,
      filterType
    ),
    queryFn: getBlockProofsQueryFn(
      blockId,
      pageIndex + 1,
      pageSize,
      filterType
    ),
  })

  // Prefetch previous page (noop if on first page)
  usePrefetchQuery({
    queryKey: getBlockProofsQueryKey(
      blockId,
      pageIndex - 1,
      pageSize,
      filterType
    ),
    queryFn:
      pageIndex > 0
        ? getBlockProofsQueryFn(blockId, pageIndex - 1, pageSize, filterType)
        : async () => Promise.resolve(null),
  })

  return {
    proofs: proofsQuery.data?.rows ?? [],
    rowCount: proofsQuery.data?.rowCount ?? 0,
    tableState,
    isLoading: proofsQuery.isLoading,
  }
}

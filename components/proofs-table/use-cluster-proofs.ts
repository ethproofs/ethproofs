"use client"

import { useDebounceValue } from "usehooks-ts"
import {
  keepPreviousData,
  usePrefetchQuery,
  useQuery,
} from "@tanstack/react-query"

import { useDataTableUrlState } from "@/components/data-table/useDataTableUrlState"

import type { ProofRow } from "./columns"

const getClusterProofsQueryKey = (
  clusterId: string,
  pageIndex: number,
  pageSize: number
) => ["cluster-proofs", clusterId, { pageIndex, pageSize }]

const getClusterProofsQueryFn =
  (clusterId: string, pageIndex: number, pageSize: number) => async () => {
    const params = new URLSearchParams()
    params.set("page_index", pageIndex.toString())
    params.set("page_size", pageSize.toString())
    const response = await fetch(
      `/api/clusters/${clusterId}/proofs?${params.toString()}`
    )
    return response.json()
  }

export function useClusterProofs(clusterId: string) {
  const tableState = useDataTableUrlState({
    initialVisibility: {
      team: false,
    },
  })
  const [deferredPagination] = useDebounceValue(tableState.pagination, 200)
  const { pageIndex, pageSize } = deferredPagination

  const queryKey = getClusterProofsQueryKey(clusterId, pageIndex, pageSize)

  const proofsQuery = useQuery<{
    rows: (ProofRow & {
      block_number: number
      block_timestamp?: string | null
    })[]
    rowCount: number
  }>({
    queryKey,
    queryFn: getClusterProofsQueryFn(clusterId, pageIndex, pageSize),
    placeholderData: keepPreviousData,
  })

  // Prefetch next page
  usePrefetchQuery({
    queryKey: getClusterProofsQueryKey(clusterId, pageIndex + 1, pageSize),
    queryFn: getClusterProofsQueryFn(clusterId, pageIndex + 1, pageSize),
  })

  // Prefetch previous page (noop if on first page)
  usePrefetchQuery({
    queryKey: getClusterProofsQueryKey(clusterId, pageIndex - 1, pageSize),
    queryFn:
      pageIndex > 0
        ? getClusterProofsQueryFn(clusterId, pageIndex - 1, pageSize)
        : async () => Promise.resolve(null),
  })

  return {
    proofs: proofsQuery.data?.rows ?? [],
    rowCount: proofsQuery.data?.rowCount ?? 0,
    tableState,
    isLoading: proofsQuery.isLoading,
  }
}

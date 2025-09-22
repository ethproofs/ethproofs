"use client"

import { useQuery } from "@tanstack/react-query"
import { useDebounceValue } from "usehooks-ts"

import type { BlockBase } from "@/lib/types"

const DEBOUNCE = 250 // ms delay before querying database

export type BlockSearchResult = BlockBase & {
  proofs: { proof_status: string }[]
}

export function useBlockSearch(query: string) {
  const [deferredQuery] = useDebounceValue(query, DEBOUNCE)

  const {
    data: blockMatch,
    isFetching,
    isLoading,
  } = useQuery<BlockSearchResult | null>({
    queryKey: ["blocks", deferredQuery],
    queryFn: async () => {
      const response = await fetch(`/api/blocks/search?query=${deferredQuery}`)
      return response.json()
    },
    enabled: !!deferredQuery && deferredQuery.length > 5,
    staleTime: 30 * 1000, // Cache for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  })

  return { blockMatch, isFetching, isLoading, deferredQuery }
}

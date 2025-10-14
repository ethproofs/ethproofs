"use client"

import { useState } from "react"
import { isHash } from "viem"

import { SearchCommand, SearchItem } from "../SearchCommand"

import { useBlockSearch } from "./useBlockSearch"

export function BlockSearch() {
  const [query, setQuery] = useState("")
  const { blockMatch, isFetching, isLoading } = useBlockSearch(query)

  const items: SearchItem[] = blockMatch
    ? [
        {
          id: blockMatch.block_number,
          href: `/blocks/${blockMatch[isHash(query) ? "hash" : "block_number"]}`,
          blockHash: blockMatch.hash ?? "",
          blockNumber: blockMatch.block_number,
          provedProofs: blockMatch.proofs.filter(
            (p) => p.proof_status === "proved"
          ).length,
          totalProofs: blockMatch.proofs.length,
        },
      ]
    : []

  return (
    <SearchCommand
      query={query}
      items={items}
      aria-label="Search by block"
      placeholder="search by block..."
      onSearch={(value: string) => setQuery(value)}
      isLoading={isFetching || isLoading}
    />
  )
}

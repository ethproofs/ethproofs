"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"

import {
  createFiltersHandler,
  createPaginationHandler,
  createSortingHandler,
  createVisibilityHandler,
  parseFiltersFromUrl,
  parsePaginationFromUrl,
  parseSortingFromUrl,
  parseVisibilityFromUrl,
} from "@/components/data-table/url-state.utils"

import { DEFAULT_PAGE_STATE } from "@/lib/constants"

interface UseDataTableUrlStateOptions {
  initialVisibility?: VisibilityState
}

/**
 * Hook that manages all table URL state (pagination, sorting, visibility, filters)
 * Returns state and handlers that sync with URL parameters
 */
export function useDataTableUrlState(
  options: UseDataTableUrlStateOptions = {}
) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Parse URL parameters
  const urlPagination = parsePaginationFromUrl(searchParams)
  const urlSorting = parseSortingFromUrl(searchParams)
  const urlVisibility = parseVisibilityFromUrl(searchParams)
  const urlFilters = parseFiltersFromUrl(searchParams)

  // Convert URL filters to ColumnFiltersState format
  const urlColumnFilters: ColumnFiltersState = Object.entries(urlFilters).map(
    ([id, value]) => ({
      id,
      value,
    })
  )

  // Initialize state from URL, with optional initial visibility defaults
  const [pagination, setPagination] = useState<PaginationState>(
    urlPagination.pageIndex > 0 || urlPagination.pageSize !== 10
      ? urlPagination
      : DEFAULT_PAGE_STATE
  )
  const [sorting, setSorting] = useState<SortingState>(urlSorting)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    Object.keys(urlVisibility).length > 0
      ? urlVisibility
      : (options.initialVisibility ?? {})
  )
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>(urlColumnFilters)

  // Create handlers that sync state with URL
  const handlePaginationChange = createPaginationHandler(
    router,
    searchParams,
    setPagination
  )

  const handleSortingChange = createSortingHandler(
    router,
    searchParams,
    sorting,
    setSorting
  )

  const handleColumnVisibilityChange = createVisibilityHandler(
    router,
    searchParams,
    columnVisibility,
    setColumnVisibility
  )

  const handleColumnFiltersChange = createFiltersHandler(
    router,
    searchParams,
    columnFilters,
    setColumnFilters
  )

  return {
    pagination,
    setPagination: handlePaginationChange,
    sorting,
    setSorting: handleSortingChange,
    columnVisibility,
    setColumnVisibility: handleColumnVisibilityChange,
    columnFilters,
    setColumnFilters: handleColumnFiltersChange,
  }
}

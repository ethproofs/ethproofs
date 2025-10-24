'use client'

import { PaginationState, SortingState, VisibilityState } from "@tanstack/react-table"

/**
 * Generic URL state management utilities for parsing component state from URL parameters
 * Works with Next.js useRouter and useSearchParams
 */

/**
 * Parse URL search params and extract pagination state
 */
export const parsePaginationFromUrl = (searchParams: URLSearchParams): PaginationState => {
  const pageIndex = searchParams.get("pageIndex")
    ? parseInt(searchParams.get("pageIndex")!, 10)
    : 0
  const pageSize = searchParams.get("pageSize")
    ? parseInt(searchParams.get("pageSize")!, 10)
    : 10

  return { pageIndex, pageSize }
}

/**
 * Parse URL search params and extract sorting state
 * Format: sort=columnId.direction (e.g., "name.asc" or "email.desc")
 * Multiple sorts can be separated by commas
 */
export const parseSortingFromUrl = (searchParams: URLSearchParams): SortingState => {
  const sortParam = searchParams.get("sort")
  if (!sortParam) return []

  return sortParam.split(",").map((sort) => {
    const [id, desc] = sort.split(".")
    return { id: id.trim(), desc: desc?.trim() === "desc" }
  })
}

/**
 * Convert sorting state to URL parameter format
 * Returns string like "name.asc,email.desc" or empty string if no sorting
 */
export const sortingToUrlParam = (sorting: SortingState): string => {
  if (!sorting.length) return ""
  return sorting.map((s) => `${s.id}.${s.desc ? "desc" : "asc"}`).join(",")
}

/**
 * Parse URL search params and extract column visibility state
 * Format: hidden=columnId1,columnId2 (only hidden columns listed)
 */
export const parseVisibilityFromUrl = (searchParams: URLSearchParams): VisibilityState => {
  const hiddenParam = searchParams.get("hidden")
  if (!hiddenParam) return {}

  const hiddenColumns = hiddenParam.split(",").map((id) => id.trim())
  const visibility: VisibilityState = {}

  // All columns in hidden list are set to false
  hiddenColumns.forEach((id) => {
    visibility[id] = false
  })

  return visibility
}

/**
 * Convert visibility state to URL parameter format
 * Returns string like "column1,column2" with hidden columns
 */
export const visibilityToUrlParam = (visibility: VisibilityState): string => {
  const hiddenColumns = Object.entries(visibility)
    .filter(([, isVisible]) => !isVisible)
    .map(([id]) => id)

  if (!hiddenColumns.length) return ""
  return hiddenColumns.join(",")
}

/**
 * Parse URL search params and extract column filter value
 */
export const parseFilterFromUrl = (
  searchParams: URLSearchParams,
  columnId: string
): string => {
  return searchParams.get(`filter_${columnId}`) || ""
}

/**
 * Parse all column filters from URL search params
 * Format: filter_columnId1=value1&filter_columnId2=value2
 */
export const parseFiltersFromUrl = (
  searchParams: URLSearchParams
): Record<string, string> => {
  const filters: Record<string, string> = {}

  searchParams.forEach((value, key) => {
    if (key.startsWith("filter_")) {
      const columnId = key.replace("filter_", "")
      filters[columnId] = decodeURIComponent(value)
    }
  })

  return filters
}

/**
 * Parse URL search params and extract a selected item ID
 * Generic version for any selection (benchmark, report, etc.)
 */
export const parseSelectedIdFromUrl = (
  searchParams: URLSearchParams,
  paramName: string
): string | undefined => {
  return searchParams.get(paramName) || undefined
}

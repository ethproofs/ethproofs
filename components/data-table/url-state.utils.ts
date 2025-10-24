"use client"

import { useRouter } from "next/navigation"
import {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  Updater,
  VisibilityState,
} from "@tanstack/react-table"

/**
 * Parse URL search params and extract pagination state
 */
export const parsePaginationFromUrl = (
  searchParams: URLSearchParams
): PaginationState => {
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
export const parseSortingFromUrl = (
  searchParams: URLSearchParams
): SortingState => {
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
export const parseVisibilityFromUrl = (
  searchParams: URLSearchParams
): VisibilityState => {
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

/**
 * Create a pagination change handler that syncs with URL
 */
export const createPaginationHandler = (
  router: ReturnType<typeof useRouter>,
  searchParams: URLSearchParams,
  setPagination: (value: PaginationState) => void
) => {
  return (updaterOrValue: Updater<PaginationState>) => {
    // Handle both direct values and updater functions
    let newPagination: PaginationState
    if (typeof updaterOrValue === "function") {
      // Need to get current state - this is a limitation, caller should pass current state
      newPagination = updaterOrValue({
        pageIndex: parseInt(searchParams.get("pageIndex") || "0"),
        pageSize: parseInt(searchParams.get("pageSize") || "10"),
      })
    } else {
      newPagination = updaterOrValue
    }

    setPagination(newPagination)

    const params = new URLSearchParams(searchParams.toString())
    params.set("pageIndex", String(newPagination.pageIndex))
    params.set("pageSize", String(newPagination.pageSize))

    router.replace(`?${params.toString()}`)
  }
}

/**
 * Create a sorting change handler that syncs with URL
 */
export const createSortingHandler = (
  router: ReturnType<typeof useRouter>,
  searchParams: URLSearchParams,
  currentSorting: SortingState,
  setSorting: (value: SortingState) => void
) => {
  return (updaterOrValue: Updater<SortingState>) => {
    const newSorting =
      typeof updaterOrValue === "function"
        ? updaterOrValue(currentSorting)
        : updaterOrValue

    setSorting(newSorting)

    const params = new URLSearchParams(searchParams.toString())
    const sortParam = sortingToUrlParam(newSorting)

    if (sortParam) {
      params.set("sort", sortParam)
    } else {
      params.delete("sort")
    }

    router.replace(`?${params.toString()}`)
  }
}

/**
 * Create a column visibility change handler that syncs with URL
 */
export const createVisibilityHandler = (
  router: ReturnType<typeof useRouter>,
  searchParams: URLSearchParams,
  currentVisibility: VisibilityState,
  setColumnVisibility: (value: VisibilityState) => void
) => {
  return (updaterOrValue: Updater<VisibilityState>) => {
    const newVisibility =
      typeof updaterOrValue === "function"
        ? updaterOrValue(currentVisibility)
        : updaterOrValue

    setColumnVisibility(newVisibility)

    const params = new URLSearchParams(searchParams.toString())
    const visibilityParam = visibilityToUrlParam(newVisibility)

    if (visibilityParam) {
      params.set("hidden", visibilityParam)
    } else {
      params.delete("hidden")
    }

    router.replace(`?${params.toString()}`)
  }
}

/**
 * Create a column filters change handler that syncs with URL
 */
export const createFiltersHandler = (
  router: ReturnType<typeof useRouter>,
  searchParams: URLSearchParams,
  currentFilters: ColumnFiltersState,
  setColumnFilters: (value: ColumnFiltersState) => void
) => {
  return (updaterOrValue: Updater<ColumnFiltersState>) => {
    const newFilters =
      typeof updaterOrValue === "function"
        ? updaterOrValue(currentFilters)
        : updaterOrValue

    setColumnFilters(newFilters)

    const params = new URLSearchParams(searchParams.toString())

    // Clear all existing filter params
    Array.from(params.keys()).forEach((key) => {
      if (key.startsWith("filter_")) {
        params.delete(key)
      }
    })

    // Add new filter params
    newFilters.forEach(({ id, value }) => {
      if (value) {
        params.set(`filter_${id}`, String(value))
      }
    })

    router.replace(`?${params.toString()}`)
  }
}

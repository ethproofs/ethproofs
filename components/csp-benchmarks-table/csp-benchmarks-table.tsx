"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  Updater,
  VisibilityState,
} from "@tanstack/react-table"

import { DataTable } from "@/components/data-table/data-table"

import { DEFAULT_PAGE_STATE } from "@/lib/constants"
import {
  parseFiltersFromUrl,
  parsePaginationFromUrl,
  parseSortingFromUrl,
  parseVisibilityFromUrl,
  sortingToUrlParam,
  visibilityToUrlParam,
} from "@/lib/url-state"
import { exportWithLabels } from "@/lib/csv-export"

import { columns, labels } from "./columns"

import { CspCollectedBenchmark } from "@/lib/api/csp-benchmarks"

interface CspBenchmarksTableProps {
  className?: string
  benchmarks: CspCollectedBenchmark[]
}

export function CspBenchmarksTable({
  className,
  benchmarks,
}: CspBenchmarksTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
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

  const [pagination, setPagination] = useState<PaginationState>(
    urlPagination.pageIndex > 0 || urlPagination.pageSize !== 10
      ? urlPagination
      : DEFAULT_PAGE_STATE
  )
  const [sorting, setSorting] = useState<SortingState>(urlSorting)
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>(urlVisibility)
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>(urlColumnFilters)

  // Sync pagination with URL when it changes
  const handlePaginationChange = (updaterOrValue: Updater<PaginationState>) => {
    // Handle both direct values and updater functions
    const newPagination =
      typeof updaterOrValue === "function"
        ? updaterOrValue(pagination)
        : updaterOrValue

    setPagination(newPagination)

    const params = new URLSearchParams(searchParams.toString())
    params.set("pageIndex", String(newPagination.pageIndex))
    params.set("pageSize", String(newPagination.pageSize))

    router.replace(`?${params.toString()}`)
  }

  // Sync sorting with URL when it changes
  const handleSortingChange = (updaterOrValue: Updater<SortingState>) => {
    // Handle both direct values and updater functions
    const newSorting =
      typeof updaterOrValue === "function"
        ? updaterOrValue(sorting)
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

  // Sync column visibility with URL when it changes
  const handleColumnVisibilityChange = (
    updaterOrValue: Updater<VisibilityState>
  ) => {
    // Handle both direct values and updater functions
    const newVisibility =
      typeof updaterOrValue === "function"
        ? updaterOrValue(columnVisibility)
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

  // Sync column filters with URL when it changes
  const handleColumnFiltersChange = (
    updaterOrValue: Updater<ColumnFiltersState>
  ) => {
    // Handle both direct values and updater functions
    const newFilters =
      typeof updaterOrValue === "function"
        ? updaterOrValue(columnFilters)
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

  const handleExport = (rows: CspCollectedBenchmark[], isFiltered: boolean) => {
    const filename = `csp-benchmarks-${new Date().toISOString().split("T")[0]}${
      isFiltered ? "-filtered" : "-all"
    }`
    exportWithLabels(rows, labels, filename)
  }

  return (
    <DataTable
      className={className}
      data={benchmarks}
      columns={columns}
      rowCount={benchmarks.length}
      pagination={pagination}
      setPagination={handlePaginationChange}
      sorting={sorting}
      setSorting={handleSortingChange}
      columnVisibility={columnVisibility}
      setColumnVisibility={handleColumnVisibilityChange}
      columnFilters={columnFilters}
      setColumnFilters={handleColumnFiltersChange}
      toolbarFilterColumnId="name"
      toolbarFilterPlaceholder="filter by benchmark name..."
      onExport={handleExport}
      columnLabels={labels}
      showToolbar={true}
      showPagination={false}
    />
  )
}

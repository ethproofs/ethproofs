"use client"

import { useMemo } from "react"
import type { SortingState } from "@tanstack/react-table"

import { DataTable } from "@/components/data-table/data-table"
import { useDataTableUrlState } from "@/components/data-table/useDataTableUrlState"

import type { SystemProperties } from "./system/properties"
import { defaultColumnVisibility, getColumns, labels } from "./columns"
import { TableFilters, useTableFilters } from "./table-filters"

import type { Metrics } from "@/lib/api/csp-benchmarks"
import { exportWithLabels } from "@/lib/csv-export"

const defaultSorting: SortingState = [
  { id: "name", desc: false },
  { id: "input_size", desc: false },
]

interface TableProps {
  className?: string
  benchmarks: Metrics[]
  allBenchmarks?: Metrics[]
  onOpenDrawer?(system: SystemProperties): void
}

export function Table({
  className,
  benchmarks,
  allBenchmarks,
  onOpenDrawer,
}: TableProps) {
  const tableState = useDataTableUrlState({
    initialVisibility: defaultColumnVisibility,
  })
  const sorting =
    tableState.sorting.length > 0 ? tableState.sorting : defaultSorting
  const { filters, setFilter, activeCount, applyFilters } = useTableFilters()
  const filtered = useMemo(() => applyFilters(benchmarks), [applyFilters, benchmarks])

  const columns = useMemo(() => getColumns({ onOpenDrawer }), [onOpenDrawer])

  const handleExport = (rows: Metrics[], isFiltered: boolean) => {
    const date = new Date().toISOString().split("T")[0]
    const hasActiveFilters = isFiltered || activeCount > 0
    const dataToExport = hasActiveFilters ? rows : (allBenchmarks ?? benchmarks)
    const filename = `csp-benchmarks-${date}${hasActiveFilters ? "-filtered" : ""}`
    exportWithLabels(dataToExport, labels, filename)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <TableFilters
          filters={filters}
          setFilter={setFilter}
          activeCount={activeCount}
        />
      </div>
      <DataTable
        className={className}
        data={filtered}
        columns={columns}
        rowCount={filtered.length}
        toolbarFilterColumnId="name"
        toolbarFilterPlaceholder="filter by name..."
        onExport={handleExport}
        columnLabels={labels}
        showPagination={false}
        {...tableState}
        sorting={sorting}
      />
    </div>
  )
}

"use client"

import { memo, useCallback, useMemo, useState } from "react"
import type { SortingState, VisibilityState } from "@tanstack/react-table"

import { DataTable } from "@/components/data-table/data-table"

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

export const Table = memo(function Table({
  className,
  benchmarks,
  allBenchmarks,
  onOpenDrawer,
}: TableProps) {
  const [sorting, setSorting] = useState<SortingState>(defaultSorting)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(defaultColumnVisibility)
  const { filters, setFilter, activeCount, applyFilters } = useTableFilters()
  const filtered = useMemo(() => applyFilters(benchmarks), [applyFilters, benchmarks])

  const columns = useMemo(() => getColumns({ onOpenDrawer }), [onOpenDrawer])

  const handleExport = useCallback((rows: Metrics[], isFiltered: boolean) => {
    const date = new Date().toISOString().split("T")[0]
    const hasActiveFilters = isFiltered || activeCount > 0
    const dataToExport = hasActiveFilters ? rows : (allBenchmarks ?? benchmarks)
    const filename = `csp-benchmarks-${date}${hasActiveFilters ? "-filtered" : ""}`
    exportWithLabels(dataToExport, labels, filename)
  }, [activeCount, allBenchmarks, benchmarks])

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
        sorting={sorting}
        setSorting={setSorting}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        toolbarFilterColumnId="name"
        toolbarFilterPlaceholder="filter by name..."
        onExport={handleExport}
        columnLabels={labels}
        showPagination={false}
      />
    </div>
  )
})

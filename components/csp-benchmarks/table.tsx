"use client"

import { useCallback, useMemo, useState } from "react"
import type { SortingState } from "@tanstack/react-table"

import { DataTable } from "@/components/data-table/data-table"
import { useDataTableUrlState } from "@/components/data-table/useDataTableUrlState"

import { SystemDrawer } from "./system/drawer"
import type { SystemProperties } from "./system/properties"
import { defaultColumnVisibility, getColumns, labels } from "./columns"

import type { Metrics } from "@/lib/api/csp-benchmarks"
import { exportWithLabels } from "@/lib/csv-export"

interface TableProps {
  className?: string
  benchmarks: Metrics[]
  allBenchmarks?: Metrics[]
}

export function Table({
  className,
  benchmarks,
  allBenchmarks,
}: TableProps) {
  const defaultSorting: SortingState = [{ id: "proof_duration", desc: false }]
  const tableState = useDataTableUrlState({
    initialVisibility: defaultColumnVisibility,
  })
  const sorting = tableState.sorting.length > 0 ? tableState.sorting : defaultSorting
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedSystem, setSelectedSystem] = useState<SystemProperties | null>(
    null
  )

  const handleOpenDrawer = useCallback((system: SystemProperties) => {
    setSelectedSystem(system)
    setDrawerOpen(true)
  }, [])

  const columns = useMemo(
    () => getColumns({ onOpenDrawer: handleOpenDrawer }),
    [handleOpenDrawer]
  )

  const handleExport = (rows: Metrics[], isFiltered: boolean) => {
    const date = new Date().toISOString().split("T")[0]
    const dataToExport = isFiltered ? rows : (allBenchmarks ?? benchmarks)
    const filename = `csp-benchmarks-${date}${isFiltered ? "-filtered" : ""}`
    exportWithLabels(dataToExport, labels, filename)
  }

  return (
    <>
      <DataTable
        className={className}
        data={benchmarks}
        columns={columns}
        rowCount={benchmarks.length}
        toolbarFilterColumnId="name"
        toolbarFilterPlaceholder="filter by proving system/zkvm..."
        onExport={handleExport}
        columnLabels={labels}
        showPagination={false}
        {...tableState}
        sorting={sorting}
      />
      <SystemDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        system={selectedSystem}
      />
    </>
  )
}

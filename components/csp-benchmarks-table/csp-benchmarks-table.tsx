"use client"

import { DataTable } from "@/components/data-table/data-table"
import { useDataTableUrlState } from "@/components/data-table/useDataTableUrlState"

import { columns, labels } from "./columns"

import { Metrics } from "@/lib/api/csp-benchmarks"
import { exportWithLabels } from "@/lib/csv-export"

interface CspBenchmarksTableProps {
  className?: string
  benchmarks: Metrics[]
}

export function CspBenchmarksTable({
  className,
  benchmarks,
}: CspBenchmarksTableProps) {
  const tableState = useDataTableUrlState()

  const handleExport = (rows: Metrics[], isFiltered: boolean) => {
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
      toolbarFilterColumnId="name"
      toolbarFilterPlaceholder="filter by benchmark name..."
      onExport={handleExport}
      columnLabels={labels}
      showPagination={false}
      {...tableState}
    />
  )
}

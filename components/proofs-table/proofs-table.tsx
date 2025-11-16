"use client"

import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"

import { Spinner } from "../ui/spinner"

import { getColumns, labels, ProofRow } from "./columns"

import { exportWithLabels } from "@/lib/csv-export"

interface ProofsTableProps {
  className?: string
  proofs: ProofRow[]
  rowCount: number
  tableState: ReturnType<
    typeof import("@/components/data-table/useDataTableUrlState").useDataTableUrlState
  >
  isLoading: boolean
  toolbarFilterColumnId?: string
  toolbarFilterPlaceholder?: string
}

export function ProofsTable({
  className,
  proofs,
  rowCount,
  tableState,
  isLoading,
  toolbarFilterColumnId,
  toolbarFilterPlaceholder,
}: ProofsTableProps) {
  const columns = useMemo(() => getColumns(), [])

  if (isLoading) {
    return (
      <div className="mt-4 flex items-center gap-2">
        <Spinner className="text-muted-foreground" />
        <p className="text-muted-foreground">loading proofs...</p>
      </div>
    )
  }

  const handleExport = (rows: ProofRow[], isFiltered: boolean) => {
    const filename = `proofs-${new Date().toISOString().split("T")[0]}${
      isFiltered ? "-filtered" : "-all"
    }`
    exportWithLabels(rows, labels, filename)
  }

  return (
    <DataTable
      className={className}
      data={proofs}
      columns={columns}
      rowCount={rowCount}
      columnLabels={labels}
      onExport={handleExport}
      toolbarFilterColumnId={toolbarFilterColumnId}
      toolbarFilterPlaceholder={toolbarFilterPlaceholder}
      {...tableState}
    />
  )
}

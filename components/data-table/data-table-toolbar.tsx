"use client"

import { Download, X as Reset } from "lucide-react"
import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { cn } from "@/lib/utils"

import { ColumnLabel, DataTableViewOptions } from "./data-table-view-options"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  filterColumnId?: string
  filterPlaceholder?: string
  onExport?: (rows: TData[], isFiltered: boolean) => void
  columnLabels?: ColumnLabel[]
}

export function DataTableToolbar<TData>({
  table,
  filterColumnId = "block_number",
  filterPlaceholder = "filter by block number...",
  onExport,
  columnLabels,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedRowsCount = selectedRows.length

  const handleExport = () => {
    if (!onExport) return

    if (selectedRowsCount === 0) {
      const allRows = table.getFilteredRowModel().rows
      const dataToExport = allRows.map((row) => row.original)
      onExport(dataToExport, isFiltered)
    } else {
      const dataToExport = selectedRows.map((row) => row.original)
      onExport(dataToExport, isFiltered)
    }
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder={filterPlaceholder}
          value={
            (table.getColumn(filterColumnId)?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn(filterColumnId)?.setFilterValue(event.target.value)
          }
          className="h-8 w-full md:w-[250px]"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
          >
            reset
            <Reset />
          </Button>
        )}
      </div>
      <div className="flex h-8 items-center gap-2 md:w-[250px]">
        <DataTableViewOptions table={table} labels={columnLabels} />
        <Button
          size="sm"
          className="ml-auto flex h-8 md:flex-1"
          onClick={handleExport}
          variant={selectedRowsCount > 0 ? "default" : "outline"}
        >
          <Download className="mr-1 h-3 w-3" />
          <span className="hidden md:inline">
            {selectedRowsCount > 0
              ? `export ${selectedRowsCount}`
              : "export all"}
          </span>
        </Button>
      </div>
    </div>
  )
}

"use client"

import { Download, X as Reset } from "lucide-react"
import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { exportBlocksToCSV } from "@/lib/csv-export"
import type { Block } from "@/lib/types"

import { DataTableViewOptions } from "./data-table-view-options"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedRowsCount = selectedRows.length

  const handleExport = () => {
    if (selectedRowsCount === 0) {
      // Export all visible rows if none selected
      const allRows = table.getFilteredRowModel().rows
      const blocksToExport = allRows.map((row) => row.original as Block)
      exportBlocksToCSV(
        blocksToExport,
        `blocks-all-${new Date().toISOString().split("T")[0]}`
      )
    } else {
      // Export only selected rows
      const blocksToExport = selectedRows.map((row) => row.original as Block)
      exportBlocksToCSV(
        blocksToExport,
        `blocks-selected-${new Date().toISOString().split("T")[0]}`
      )
    }
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder="filter by block number..."
          value={
            (table.getColumn("block_number")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("block_number")?.setFilterValue(event.target.value)
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
        <DataTableViewOptions table={table} />
        <Button
          size="sm"
          className="ml-auto hidden h-8 md:flex md:flex-1"
          onClick={handleExport}
          variant={selectedRowsCount > 0 ? "default" : "outline"}
        >
          <Download className="mr-1 h-3 w-3" />
          {selectedRowsCount > 0 ? `export ${selectedRowsCount}` : "export all"}
        </Button>
      </div>
    </div>
  )
}

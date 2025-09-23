"use client"

import { X as Reset } from "lucide-react"
import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { DataTableViewOptions } from "./data-table-view-options"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

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
        <Button size="sm" className="ml-auto hidden h-8 md:flex md:flex-1">
          export
        </Button>
      </div>
    </div>
  )
}

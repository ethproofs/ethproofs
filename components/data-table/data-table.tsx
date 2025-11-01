"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  OnChangeFn,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { cn } from "@/lib/utils"

import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"
import { ColumnLabel } from "./data-table-view-options"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  rowCount: number
  pagination: PaginationState
  setPagination?: OnChangeFn<PaginationState>
  sorting?: SortingState
  setSorting?: OnChangeFn<SortingState>
  columnVisibility?: VisibilityState
  setColumnVisibility?: OnChangeFn<VisibilityState>
  columnFilters?: ColumnFiltersState
  setColumnFilters?: OnChangeFn<ColumnFiltersState>
  toolbarFilterColumnId?: string
  toolbarFilterPlaceholder?: string
  onExport?: (rows: TData[], isFiltered: boolean) => void
  columnLabels?: ColumnLabel[]
  className?: string
  showToolbar?: boolean
  showPagination?: boolean
}
export function DataTable<TData, TValue>({
  columns,
  data,
  rowCount,
  pagination,
  setPagination,
  sorting: externalSorting,
  setSorting: externalSetSorting,
  columnVisibility: externalColumnVisibility,
  setColumnVisibility: externalSetColumnVisibility,
  columnFilters: externalColumnFilters,
  setColumnFilters: externalSetColumnFilters,
  toolbarFilterColumnId,
  toolbarFilterPlaceholder,
  onExport,
  columnLabels,
  className,
  showToolbar = true,
  showPagination = true,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [internalColumnVisibility, setInternalColumnVisibility] =
    React.useState<VisibilityState>(externalColumnVisibility || {})
  const [internalColumnFilters, setInternalColumnFilters] =
    React.useState<ColumnFiltersState>(externalColumnFilters || [])
  const [internalSorting, setInternalSorting] = React.useState<SortingState>(
    externalSorting || []
  )

  // Use external sorting if provided, otherwise use internal
  const sorting =
    externalSorting !== undefined ? externalSorting : internalSorting
  const handleSortingChange = externalSetSorting || setInternalSorting

  // Use external column visibility if provided, otherwise use internal
  const columnVisibility =
    externalColumnVisibility !== undefined
      ? externalColumnVisibility
      : internalColumnVisibility
  const handleColumnVisibilityChange =
    externalSetColumnVisibility || setInternalColumnVisibility

  // Use external column filters if provided, otherwise use internal
  const columnFilters =
    externalColumnFilters !== undefined
      ? externalColumnFilters
      : internalColumnFilters
  const handleColumnFiltersChange =
    externalSetColumnFilters || setInternalColumnFilters

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    rowCount,
    enableRowSelection: true,
    manualPagination: true,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {showToolbar && (
        <DataTableToolbar
          table={table}
          filterColumnId={toolbarFilterColumnId}
          filterPlaceholder={toolbarFilterPlaceholder}
          onExport={onExport}
          columnLabels={columnLabels}
        />
      )}
      <div className="overflow-x-auto rounded-md border">
        <Table className="min-w-max">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  no results
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination && <DataTablePagination table={table} />}
    </div>
  )
}

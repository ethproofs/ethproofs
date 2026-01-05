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

import { DEFAULT_PAGE_SIZE } from "@/lib/constants"

import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"
import { ColumnLabel } from "./data-table-view-options"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  rowCount?: number
  pagination?: PaginationState
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
  onEdit?: (row: TData) => void
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
  onEdit,
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
  const [internalPagination, setInternalPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  })

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

  // Use external pagination if provided, otherwise use internal
  const currentPagination = pagination ?? internalPagination
  const handlePaginationChange = setPagination ?? setInternalPagination
  const currentRowCount = rowCount ?? data.length

  const table = useReactTable({
    data,
    columns,
    meta: { onEdit },
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: currentPagination,
    },
    rowCount: currentRowCount,
    enableRowSelection: true,
    manualPagination: setPagination !== undefined,
    onPaginationChange: handlePaginationChange,
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
      <div className="h-[calc(100vh-250px)] overflow-auto rounded-md border">
        <Table>
          {table.getRowModel().rows?.length > 0 && (
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
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
          )}
          <TableBody
            className={
              (table.getState().columnFilters.length === 0 &&
                table.getRowModel().rows?.length > DEFAULT_PAGE_SIZE) ||
              table.getRowModel().rows?.length === 0
                ? "[&_tr:last-child]:border-0"
                : ""
            }
          >
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-muted/20"
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
              <TableRow className="hover:bg-transparent">
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

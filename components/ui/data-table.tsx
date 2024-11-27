"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
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

import { Button } from "./button"

type Props<TData, TValue> = {
  className?: string
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
  sorting?: { id: string; desc: boolean }[]
}

const DataTable = <TData, TValue>({
  data,
  columns,
  className,
  sorting = [],
}: Props<TData, TValue>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
    state: {
      sorting,
    },
  })

  return (
    <div className={cn("flex w-full flex-col gap-8", className)}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
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

        <TableBody className="font-mono">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className={cn("p-4 align-top")}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-center gap-6">
        <Button
          variant="outline"
          isSecondary
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="lowercase"
        >
          Previous
        </Button>
        <span className="flex items-center gap-1 font-mono uppercase text-body-secondary">
          <div>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount().toLocaleString()}
          </div>
        </span>
        <Button
          variant="outline"
          isSecondary
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="lowercase"
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default DataTable

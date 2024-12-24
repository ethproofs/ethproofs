import { flexRender, Table as TableType } from "@tanstack/react-table"

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

type Props<TData> = {
  className?: string
  table: TableType<TData>
}

const DataTable = <TData,>({ className, table }: Props<TData>) => {
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
                className="hover:bg-primary/5 dark:hover:bg-primary/10"
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
              <TableCell
                colSpan={table.getHeaderGroups()[0].headers.length}
                className="h-24 text-center"
              >
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
            {table.getPageCount() === 0
              ? 1
              : table.getPageCount().toLocaleString()}
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

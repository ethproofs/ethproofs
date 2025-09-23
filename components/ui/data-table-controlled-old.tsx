"use client"

import {
  ColumnDef,
  getCoreRowModel,
  OnChangeFn,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table"

import DataTable from "./data-table-old"

interface Props<TData> {
  className?: string
  columns: {
    [K in keyof TData]: ColumnDef<TData, TData[K]>
  }[keyof TData][]
  data: TData[]
  rowCount: number
  pagination: PaginationState
  setPagination: OnChangeFn<PaginationState>
}

const DataTableControlled = <TData,>({
  data,
  columns,
  className,
  rowCount,
  pagination,
  setPagination,
}: Props<TData>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    rowCount,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    manualPagination: true,
  })

  return <DataTable className={className} table={table} />
}

export default DataTableControlled

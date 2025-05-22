"use client"

import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import DataTable from "./data-table"

type Props<TData, TValue> = {
  className?: string
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
  sorting?: { id: string; desc: boolean }[]
  hidePagination?: boolean
}

const DataTableUncontrolled = <TData, TValue>({
  data,
  columns,
  className,
  sorting = [],
  hidePagination = false,
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
    <DataTable
      className={className}
      table={table}
      hidePagination={hidePagination}
    />
  )
}

export default DataTableUncontrolled

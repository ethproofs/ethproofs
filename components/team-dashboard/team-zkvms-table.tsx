"use client"

import { DataTable } from "@/components/data-table/data-table"

import { DashboardZkvm, zkvmColumns } from "./zkvm-columns"

interface TeamZkvmsTableProps {
  zkvms: DashboardZkvm[]
  onEdit: (zkvm: DashboardZkvm) => void
}

export function TeamZkvmsTable({ zkvms, onEdit }: TeamZkvmsTableProps) {
  return (
    <DataTable
      className="mt-4"
      columns={zkvmColumns}
      data={zkvms}
      onEdit={onEdit}
      showToolbar={false}
      showPagination={zkvms.length > 10}
    />
  )
}

"use client"

import { useMemo, useState } from "react"
import { PaginationState } from "@tanstack/react-table"

import type { GuestProgram } from "@/lib/types"

import { DataTable } from "@/components/data-table/data-table"

import { DEFAULT_PAGE_STATE } from "@/lib/constants"

import { getColumns } from "./columns"

export type GuestProgramRow = GuestProgram & {
  totalClusters: number
  activeClusters: number
}

interface GuestProgramsTableProps {
  className?: string
  guestPrograms: GuestProgramRow[]
  totalActiveClusters: number
}

export function GuestProgramsTable({
  className,
  guestPrograms,
  totalActiveClusters,
}: GuestProgramsTableProps) {
  const [pagination, setPagination] =
    useState<PaginationState>(DEFAULT_PAGE_STATE)

  const columns = useMemo(
    () => getColumns({ totalActiveClusters }),
    [totalActiveClusters]
  )

  return (
    <DataTable
      className={className}
      data={guestPrograms}
      columns={columns}
      rowCount={guestPrograms.length}
      pagination={pagination}
      setPagination={setPagination}
      showToolbar={false}
      showPagination={false}
    />
  )
}

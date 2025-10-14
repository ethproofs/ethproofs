"use client"

import { useState } from "react"
import { PaginationState } from "@tanstack/react-table"

import { DataTable } from "@/components/data-table/data-table"

import { DEFAULT_PAGE_STATE } from "@/lib/constants"

import { columns } from "./columns"

import { Team, Zkvm, ZkvmMetrics, ZkvmVersion } from "@/lib/types"

export type ZkvmRow = Zkvm & {
  versions: ZkvmVersion[]
  team: Team
  totalClusters: number
  activeClusters: number
  metrics?: Partial<ZkvmMetrics> | undefined
}

interface ZkvmsTableProps {
  className?: string
  zkvms: ZkvmRow[]
}
export function ZkvmsTable({ className, zkvms }: ZkvmsTableProps) {
  const [pagination, setPagination] =
    useState<PaginationState>(DEFAULT_PAGE_STATE)

  return (
    <DataTable
      className={className}
      data={zkvms}
      columns={columns}
      rowCount={zkvms.length}
      pagination={pagination}
      setPagination={setPagination}
      showToolbar={false}
      showPagination={false}
    />
  )
}

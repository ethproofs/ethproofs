"use client"

import { useState } from "react"
import { PaginationState } from "@tanstack/react-table"

import type { CohortRow } from "@/lib/types"

import { DataTable } from "@/components/data-table/data-table"

import { DEFAULT_PAGE_STATE } from "@/lib/constants"

import { columns } from "./columns"

interface CohortTableProps {
  rows: CohortRow[]
}

export function CohortTable({ rows }: CohortTableProps) {
  const [pagination, setPagination] =
    useState<PaginationState>(DEFAULT_PAGE_STATE)

  return (
    <DataTable
      data={rows}
      columns={columns}
      rowCount={rows.length}
      pagination={pagination}
      setPagination={setPagination}
      showToolbar={false}
      showPagination={false}
    />
  )
}

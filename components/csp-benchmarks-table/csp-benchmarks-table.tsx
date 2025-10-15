"use client"

import { useState } from "react"
import { PaginationState } from "@tanstack/react-table"

import { DataTable } from "@/components/data-table/data-table"

import { DEFAULT_PAGE_STATE } from "@/lib/constants"

import { columns } from "./columns"

import { CspCollectedBenchmark } from "@/lib/api/csp-benchmarks"

interface CspBenchmarksTableProps {
  className?: string
  benchmarks: CspCollectedBenchmark[]
}

export function CspBenchmarksTable({
  className,
  benchmarks,
}: CspBenchmarksTableProps) {
  const [pagination, setPagination] =
    useState<PaginationState>(DEFAULT_PAGE_STATE)

  return (
    <DataTable
      className={className}
      data={benchmarks}
      columns={columns}
      rowCount={benchmarks.length}
      pagination={pagination}
      setPagination={setPagination}
      showToolbar={false}
      showPagination={false}
    />
  )
}

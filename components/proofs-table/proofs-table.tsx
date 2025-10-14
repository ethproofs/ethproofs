"use client"

import { useMemo, useState } from "react"
import { PaginationState } from "@tanstack/react-table"

import { DataTable } from "@/components/data-table/data-table"

import { DEFAULT_PAGE_STATE } from "@/lib/constants"

import { getColumns, ProofRow } from "./columns"

interface ProofsTableProps {
  className?: string
  proofs: ProofRow[]
  showBlockNumber?: boolean
  showTeam?: boolean
}

export function ProofsTable({
  className,
  proofs,
  showBlockNumber,
  showTeam,
}: ProofsTableProps) {
  const [pagination, setPagination] =
    useState<PaginationState>(DEFAULT_PAGE_STATE)

  // Sort by proving_time (fastest first), with nulls at the end
  const sortedProofs = useMemo(() => {
    return [...proofs].sort((a, b) => {
      if (a.proving_time === null) return 1
      if (b.proving_time === null) return -1
      return a.proving_time - b.proving_time
    })
  }, [proofs])

  const columns = useMemo(
    () => getColumns({ showBlockNumber, showTeam }),
    [showBlockNumber, showTeam]
  )

  return (
    <DataTable
      className={className}
      showToolbar={false}
      data={sortedProofs}
      columns={columns}
      rowCount={sortedProofs.length}
      pagination={pagination}
      setPagination={setPagination}
      showPagination={false}
    />
  )
}

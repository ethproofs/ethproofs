"use client"

import { useState } from "react"
import { useDebounceValue } from "usehooks-ts"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import type { ProofWithCluster } from "@/lib/types"

import { DEFAULT_PAGE_STATE } from "@/lib/constants"

import DataTableControlled from "../ui/data-table-controlled"

import { columns } from "./columns"

type Props = {
  className?: string
  teamId: string
}

const TeamProofsTable = ({ className, teamId }: Props) => {
  const [pagination, setPagination] =
    useState<PaginationState>(DEFAULT_PAGE_STATE)
  const [deferredPagination] = useDebounceValue(pagination, 200)

  const proofsQuery = useQuery<{ rows: ProofWithCluster[]; rowCount: number }>({
    queryKey: ["proofs", teamId, deferredPagination],
    queryFn: async () => {
      const response = await fetch(
        `/api/proofs/${teamId}?page_index=${deferredPagination.pageIndex}&page_size=${deferredPagination.pageSize}`
      )
      return response.json()
    },
    placeholderData: keepPreviousData,
  })

  return (
    <DataTableControlled
      className={className}
      columns={columns}
      data={proofsQuery.data?.rows ?? []}
      rowCount={proofsQuery.data?.rowCount ?? 0}
      pagination={pagination}
      setPagination={setPagination}
    />
  )
}

export default TeamProofsTable

"use client"

import { useState } from "react"
import { PaginationState } from "@tanstack/react-table"

import {
  ClusterBase,
  ClusterVersionBase,
  Team,
  Zkvm,
  ZkvmVersion,
} from "@/lib/types"

import { DataTable } from "@/components/data-table/data-table"

import { DEFAULT_PAGE_STATE } from "@/lib/constants"

import { columns } from "./columns"

type ClusterWithRelations = ClusterBase & {
  team: Team
  versions: Array<
    ClusterVersionBase & {
      zkvm_version: ZkvmVersion & {
        zkvm: Zkvm
      }
    }
  >
}

export type ClusterRow = ClusterWithRelations & {
  avg_cost: number
  avg_time: number
}

interface ClustersTableProps {
  className?: string
  clusters: ClusterRow[]
}
export function ClustersTable({ className, clusters }: ClustersTableProps) {
  const [pagination, setPagination] =
    useState<PaginationState>(DEFAULT_PAGE_STATE)

  return (
    <DataTable
      className={className}
      data={clusters}
      columns={columns}
      rowCount={clusters.length}
      pagination={pagination}
      setPagination={setPagination}
      showToolbar={false}
      showPagination={false}
    />
  )
}

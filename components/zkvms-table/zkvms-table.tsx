"use client"

import { useMemo, useState } from "react"
import { PaginationState } from "@tanstack/react-table"

import type {
  ClusterSummary,
  Team,
  Zkvm,
  ZkvmMetrics,
  ZkvmVersion,
} from "@/lib/types"

import { DataTable } from "@/components/data-table/data-table"

import { DEFAULT_PAGE_STATE } from "@/lib/constants"

import { getColumns } from "./columns"
import { ZkvmDrawer } from "./zkvm-drawer"

export type ZkvmRow = Zkvm & {
  versions: ZkvmVersion[]
  team: Team
  totalClusters: number
  activeClusters: number
  metrics?: Partial<ZkvmMetrics> | undefined
  clusters: ClusterSummary[]
}

interface ZkvmsTableProps {
  className?: string
  zkvms: ZkvmRow[]
}

export function ZkvmsTable({ className, zkvms }: ZkvmsTableProps) {
  const [pagination, setPagination] =
    useState<PaginationState>(DEFAULT_PAGE_STATE)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedZkvm, setSelectedZkvm] = useState<ZkvmRow | null>(null)

  const handleOpenDrawer = (zkvm: ZkvmRow) => {
    setSelectedZkvm(zkvm)
    setDrawerOpen(true)
  }

  const columns = useMemo(
    () => getColumns({ onOpenDrawer: handleOpenDrawer }),
    []
  )

  return (
    <>
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
      <ZkvmDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        zkvm={selectedZkvm}
        metrics={selectedZkvm?.metrics}
        clusters={selectedZkvm?.clusters ?? []}
      />
    </>
  )
}

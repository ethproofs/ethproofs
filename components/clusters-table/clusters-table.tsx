"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { PaginationState } from "@tanstack/react-table"

import {
  ClusterBase,
  ClusterVersionBase,
  GuestProgram,
  ProverType,
  Team,
  Zkvm,
  ZkvmVersion,
} from "@/lib/types"

import { DataTable } from "@/components/data-table/data-table"

import { DEFAULT_PAGE_STATE } from "@/lib/constants"

import { ClusterDrawer } from "./cluster-drawer"
import { getColumns } from "./columns"

type ClusterWithRelations = ClusterBase & {
  team: Team
  prover_type: ProverType | null
  guest_program: GuestProgram | null
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

const CLUSTER_PARAM = "cluster"

interface ClustersTableProps {
  className?: string
  clusters: ClusterRow[]
  minHeight?: number
}
export function ClustersTable({
  className,
  clusters,
  minHeight,
}: ClustersTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [pagination, setPagination] =
    useState<PaginationState>(DEFAULT_PAGE_STATE)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedCluster, setSelectedCluster] = useState<ClusterRow | null>(
    null
  )

  const handleOpenDrawer = useCallback((cluster: ClusterRow) => {
    setSelectedCluster(cluster)
    setDrawerOpen(true)
  }, [])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setDrawerOpen(open)
      if (!open && searchParams.get(CLUSTER_PARAM)) {
        const next = new URLSearchParams(searchParams.toString())
        next.delete(CLUSTER_PARAM)
        const query = next.toString()
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        })
      }
    },
    [pathname, router, searchParams]
  )

  useEffect(() => {
    const paramId = searchParams.get(CLUSTER_PARAM)
    if (!paramId) return
    const match = clusters.find((c) => c.id === paramId)
    if (match) {
      setSelectedCluster(match)
      setDrawerOpen(true)
    }
  }, [clusters, searchParams])

  const columns = useMemo(
    () => getColumns({ onOpenDrawer: handleOpenDrawer }),
    [handleOpenDrawer]
  )

  return (
    <>
      <DataTable
        className={className}
        data={clusters}
        columns={columns}
        rowCount={clusters.length}
        pagination={pagination}
        setPagination={setPagination}
        showToolbar={false}
        showPagination={false}
        minHeight={minHeight}
      />
      <ClusterDrawer
        open={drawerOpen}
        onOpenChange={handleOpenChange}
        cluster={selectedCluster}
      />
    </>
  )
}

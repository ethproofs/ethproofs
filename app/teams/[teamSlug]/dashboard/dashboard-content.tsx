"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { ClusterDrawer } from "@/components/team-dashboard/cluster-drawer"
import { DashboardCluster } from "@/components/team-dashboard/columns"
import { TeamClustersTable } from "@/components/team-dashboard/team-clusters-table"
import { Button } from "@/components/ui/button"

type Team = {
  id: string
  name: string
  slug: string
  approved: boolean
}

type ZkvmVersion = {
  id: number
  version: string
  zkvm: {
    id: number
    name: string
    slug: string
  }
}

type ProverType = {
  id: number
  name: string
  processing_ratio: string
  gpu_configuration: string
  deployment_type: string
}

type Cluster = {
  id: string
  name: string
  num_gpus: number
  hardware_description: string | null
  is_active: boolean
  prover_type: ProverType | null
  versions: {
    id: number
    index: number
    zkvm_version_id: number
    vk_path: string | null
    is_active: boolean
    zkvm_version?: {
      version: string
      zkvm: {
        name: string
      }
    }
  }[]
}

interface DashboardContentProps {
  team: Team
  clusters: Cluster[]
  zkvmVersions: ZkvmVersion[]
  proverTypes: ProverType[]
}

export function DashboardContent({
  team,
  clusters,
  zkvmVersions,
  proverTypes,
}: DashboardContentProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingCluster, setEditingCluster] = useState<DashboardCluster | null>(
    null
  )

  const handleCreate = () => {
    setEditingCluster(null)
    setDrawerOpen(true)
  }

  const handleEdit = (cluster: DashboardCluster) => {
    setEditingCluster(cluster)
    setDrawerOpen(true)
  }

  const handleCloseDrawer = (open: boolean) => {
    setDrawerOpen(open)
    if (!open) {
      setEditingCluster(null)
    }
  }

  return (
    <>
      <div className="flex items-end justify-between px-6">
        <span className="text-2xl">{team.name} dashboard</span>
        <Button onClick={handleCreate} className="h-8">
          <Plus className="size-4" />
          create cluster
        </Button>
      </div>

      {clusters.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">create one to get started!</p>
        </div>
      ) : (
        <TeamClustersTable clusters={clusters} onEdit={handleEdit} />
      )}

      <ClusterDrawer
        mode={editingCluster ? "edit" : "create"}
        cluster={editingCluster || undefined}
        zkvmVersions={zkvmVersions}
        proverTypes={proverTypes}
        open={drawerOpen}
        onOpenChange={handleCloseDrawer}
        teamSlug={team.slug}
      />
    </>
  )
}

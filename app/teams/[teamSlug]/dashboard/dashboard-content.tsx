"use client"

import { useState } from "react"
import { Globe, Pencil, Plus } from "lucide-react"

import GitHubLogo from "@/components/svgs/github-logo.svg"
import XLogo from "@/components/svgs/x-logo.svg"
import { ClusterDrawer } from "@/components/team-dashboard/cluster-drawer"
import { DashboardCluster } from "@/components/team-dashboard/columns"
import { TeamClustersTable } from "@/components/team-dashboard/team-clusters-table"
import { TeamProfileDrawer } from "@/components/team-dashboard/team-profile-drawer"
import { Button } from "@/components/ui/button"

type Team = {
  id: string
  name: string
  slug: string
  approved: boolean
  github_org: string | null
  twitter_handle: string | null
  website_url: string | null
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

type GuestProgram = {
  id: number
  name: string
}

type Cluster = {
  id: string
  name: string
  num_gpus: number
  hardware_description: string | null
  is_active: boolean
  prover_type: ProverType | null
  guest_program: GuestProgram | null
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
  guestPrograms: GuestProgram[]
}

export function DashboardContent({
  team,
  clusters,
  zkvmVersions,
  proverTypes,
  guestPrograms,
}: DashboardContentProps) {
  const [clusterDrawerOpen, setClusterDrawerOpen] = useState(false)
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false)
  const [editingCluster, setEditingCluster] = useState<DashboardCluster | null>(
    null
  )

  const handleCreate = () => {
    setEditingCluster(null)
    setClusterDrawerOpen(true)
  }

  const handleEdit = (cluster: DashboardCluster) => {
    setEditingCluster(cluster)
    setClusterDrawerOpen(true)
  }

  const handleCloseClusterDrawer = (open: boolean) => {
    setClusterDrawerOpen(open)
    if (!open) {
      setEditingCluster(null)
    }
  }

  const hasTeamLinks =
    team.website_url || team.twitter_handle || team.github_org

  return (
    <>
      <div className="space-y-4 px-6">
        <div className="flex items-end justify-between">
          <span className="text-2xl">{team.name} dashboard</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setProfileDrawerOpen(true)}
              className="h-8"
            >
              <Pencil className="size-4" />
              edit profile
            </Button>
            <Button onClick={handleCreate} className="h-8">
              <Plus className="size-4" />
              create cluster
            </Button>
          </div>
        </div>

        {hasTeamLinks && (
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {team.website_url && (
              <a
                href={team.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-foreground"
              >
                <Globe className="size-4" />
                {new URL(team.website_url).host}
              </a>
            )}
            {team.twitter_handle && (
              <a
                href={`https://x.com/${team.twitter_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-foreground"
              >
                <XLogo className="h-3 w-auto" />@{team.twitter_handle}
              </a>
            )}
            {team.github_org && (
              <a
                href={`https://github.com/${team.github_org}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-foreground"
              >
                <GitHubLogo className="size-4" />
                {team.github_org}
              </a>
            )}
          </div>
        )}
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
        guestPrograms={guestPrograms}
        open={clusterDrawerOpen}
        onOpenChange={handleCloseClusterDrawer}
        teamSlug={team.slug}
      />

      <TeamProfileDrawer
        team={team}
        open={profileDrawerOpen}
        onOpenChange={setProfileDrawerOpen}
      />
    </>
  )
}

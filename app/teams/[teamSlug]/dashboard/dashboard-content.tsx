"use client"

import { useState } from "react"
import { Globe, Pencil, Plus } from "lucide-react"

import type { Team } from "@/lib/types"

import GitHubLogo from "@/components/svgs/github-logo.svg"
import XLogo from "@/components/svgs/x-logo.svg"
import { ClusterDrawer } from "@/components/team-dashboard/cluster-drawer"
import { DashboardCluster } from "@/components/team-dashboard/columns"
import { TeamClustersTable } from "@/components/team-dashboard/team-clusters-table"
import { TeamProfileDrawer } from "@/components/team-dashboard/team-profile-drawer"
import { TeamZkvmsTable } from "@/components/team-dashboard/team-zkvms-table"
import { DashboardZkvm } from "@/components/team-dashboard/zkvm-columns"
import { ZkvmDrawer } from "@/components/team-dashboard/zkvm-drawer"
import { Button } from "@/components/ui/button"
import { BaseLink } from "@/components/ui/link"

import { getHost } from "@/lib/url"

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
  zkvms: DashboardZkvm[]
  zkvmVersions: ZkvmVersion[]
  proverTypes: ProverType[]
  guestPrograms: GuestProgram[]
}

export function DashboardContent({
  team,
  clusters,
  zkvms,
  zkvmVersions,
  proverTypes,
  guestPrograms,
}: DashboardContentProps) {
  const [isClusterDrawerOpen, setIsClusterDrawerOpen] = useState(false)
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false)
  const [isZkvmDrawerOpen, setIsZkvmDrawerOpen] = useState(false)
  const [editingCluster, setEditingCluster] = useState<DashboardCluster | null>(
    null
  )
  const [editingZkvm, setEditingZkvm] = useState<DashboardZkvm | null>(null)

  const handleCreateCluster = () => {
    setEditingCluster(null)
    setIsClusterDrawerOpen(true)
  }

  const handleEditCluster = (cluster: DashboardCluster) => {
    setEditingCluster(cluster)
    setIsClusterDrawerOpen(true)
  }

  const handleCloseClusterDrawer = (open: boolean) => {
    setIsClusterDrawerOpen(open)
    if (!open) {
      setEditingCluster(null)
    }
  }

  const handleCreateZkvm = () => {
    setEditingZkvm(null)
    setIsZkvmDrawerOpen(true)
  }

  const handleEditZkvm = (zkvm: DashboardZkvm) => {
    setEditingZkvm(zkvm)
    setIsZkvmDrawerOpen(true)
  }

  const handleCloseZkvmDrawer = (open: boolean) => {
    setIsZkvmDrawerOpen(open)
    if (!open) {
      setEditingZkvm(null)
    }
  }

  const hasTeamLinks =
    team.website_url || team.twitter_handle || team.github_org

  return (
    <>
      <div className="space-y-2 px-6">
        <div className="flex items-end justify-between">
          <span className="text-2xl">{team.name} dashboard</span>
          <Button
            variant="outline"
            onClick={() => setIsProfileDrawerOpen(true)}
            className="h-8"
          >
            <Pencil className="size-4" />
            edit profile
          </Button>
        </div>

        {hasTeamLinks && (
          <div className="flex flex-wrap gap-4">
            {team.website_url && (
              <BaseLink
                href={team.website_url}
                hideArrow
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <Globe className="size-4" />
                {getHost(team.website_url) || team.website_url}
              </BaseLink>
            )}
            {team.twitter_handle && (
              <BaseLink
                href={`https://x.com/${team.twitter_handle}`}
                hideArrow
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <XLogo className="h-3 w-auto" />@{team.twitter_handle}
              </BaseLink>
            )}
            {team.github_org && (
              <BaseLink
                href={`https://github.com/${team.github_org}`}
                hideArrow
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <GitHubLogo className="size-4" />
                {team.github_org}
              </BaseLink>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <div className="space-y-2 px-6">
          <div className="flex items-end justify-between">
            <span className="text-xl">zkvms</span>
            <div className="p-1">
              <Button onClick={handleCreateZkvm} className="h-8">
                <Plus className="size-4" />
                create zkvm
              </Button>
            </div>
          </div>
          {zkvms.length === 0 ? (
            <div className="rounded-md border p-4 py-8 text-center">
              <p className="text-muted-foreground">no zkvms yet</p>
            </div>
          ) : (
            <TeamZkvmsTable zkvms={zkvms} onEdit={handleEditZkvm} />
          )}
        </div>
      </div>

      <div className="mt-6 space-y-2 px-6">
        <div className="flex items-end justify-between">
          <span className="text-xl">clusters</span>
          <div className="p-1">
            <Button onClick={handleCreateCluster} className="h-8">
              <Plus className="size-4" />
              create cluster
            </Button>
          </div>
        </div>
        {clusters.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">no clusters yet</p>
          </div>
        ) : (
          <TeamClustersTable clusters={clusters} onEdit={handleEditCluster} />
        )}
      </div>

      <ClusterDrawer
        mode={editingCluster ? "edit" : "create"}
        cluster={editingCluster || undefined}
        zkvmVersions={zkvmVersions}
        proverTypes={proverTypes}
        guestPrograms={guestPrograms}
        open={isClusterDrawerOpen}
        onOpenChange={handleCloseClusterDrawer}
        teamSlug={team.slug}
      />

      <ZkvmDrawer
        mode={editingZkvm ? "edit" : "create"}
        zkvm={editingZkvm || undefined}
        open={isZkvmDrawerOpen}
        onOpenChange={handleCloseZkvmDrawer}
        teamSlug={team.slug}
      />

      <TeamProfileDrawer
        team={team}
        open={isProfileDrawerOpen}
        onOpenChange={setIsProfileDrawerOpen}
      />
    </>
  )
}

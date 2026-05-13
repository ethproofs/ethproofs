"use client"

import { Globe } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import type { ProofWithCluster, Team } from "@/lib/types"

import { BlockNumber } from "@/components/BlockNumber"
import CopyButton from "@/components/copy-button"
import { Null } from "@/components/null"
import DownloadButton from "@/components/proof-buttons/download-button"
import DownloadRecentClusterProofsButton from "@/components/proof-buttons/download-recent-cluster-proofs-button"
import { VerifyButton } from "@/components/proof-buttons/verify-button"
import GitHubLogo from "@/components/svgs/github-logo.svg"
import XLogo from "@/components/svgs/x-logo.svg"
import { TeamLogoLink } from "@/components/team-logo-link"
import { Card } from "@/components/ui/card"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Item, ItemContent, ItemGroup, ItemMedia } from "@/components/ui/item"
import Link from "@/components/ui/link"

import { truncateHash } from "@/lib/utils"

import {
  RTP_PARALYZER_CUTOFF_MINUTES,
  RTP_PERFORMANCE_TIME_THRESHOLD_MS,
} from "@/lib/constants"

import type { ClusterRow } from "./clusters-table"

import { isMultiGpuCluster } from "@/lib/cluster"
import { formatTimeAgoDetailed } from "@/lib/date"
import { formatUsd } from "@/lib/number"
import { hasProvedTimestamp, isCompleted } from "@/lib/proofs"
import { prettyMs } from "@/lib/time"
import { getHost, getTwitterHandle } from "@/lib/url"
import { isUnverifiableZkvm } from "@/lib/zkvms.utils"

const RECENT_PROOFS_LIMIT = 25
const PARALYZER_CUTOFF_MS = RTP_PARALYZER_CUTOFF_MINUTES * 60 * 1000

function getProvingTimeColor(provingTime: number): string {
  if (provingTime < RTP_PERFORMANCE_TIME_THRESHOLD_MS) return "text-level-best"
  if (provingTime < PARALYZER_CUTOFF_MS) return "text-level-middle"
  return "text-level-worst"
}

interface ClusterDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cluster: ClusterRow | null
}

export function ClusterDrawer({
  open,
  onOpenChange,
  cluster,
}: ClusterDrawerProps) {
  const clusterId = cluster?.id ?? null

  const { data: recentProofs, isLoading: isLoadingProofs } = useQuery<
    ProofWithCluster[]
  >({
    queryKey: ["cluster-recent-proofs", clusterId],
    queryFn: async () => {
      const params = new URLSearchParams({
        page_index: "0",
        page_size: String(RECENT_PROOFS_LIMIT),
      })
      const response = await fetch(
        `/api/clusters/${clusterId}/proofs?${params.toString()}`
      )
      const data = await response.json()
      return data.rows ?? []
    },
    enabled: open && Boolean(clusterId),
  })

  if (!cluster) return null

  const team = cluster.team
  const lastVersion = cluster.versions[0]
  const zkvm = lastVersion?.zkvm_version.zkvm
  const isOpenSource = cluster.is_open_source
  const hasBinary = (cluster.software_link ?? "").length > 0
  const hasAvgTime = cluster.avg_time > 0
  const hasAvgCost = cluster.avg_cost > 0

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-full w-[420px] overflow-y-auto border-l outline-none focus-visible:outline-none">
        <DrawerHeader className="border-b pb-4">
          <div className="flex items-center justify-between gap-4">
            <DrawerTitle
              className="min-w-0 flex-1 truncate text-xl"
              title={cluster.name}
            >
              {cluster.name}
            </DrawerTitle>
            <TeamLogoLink team={team} height={18} className="shrink-0" />
          </div>
          <div className="flex items-center gap-1 text-xs text-body-secondary">
            <span className="truncate font-mono" title={cluster.id}>
              {truncateHash(cluster.id, 8, 8)}
            </span>
            <CopyButton
              message={cluster.id}
              className="size-6"
              iconClassName="size-3"
            />
          </div>
          <div className="text-left font-sans text-xs text-body-secondary">
            {isMultiGpuCluster(cluster)
              ? "multi-GPU cluster"
              : "single-GPU cluster"}
            {" / "}
            {cluster.hardware_description}
          </div>
        </DrawerHeader>

        <div className="border-b py-4">
          <div className="flex flex-wrap justify-center gap-x-4 text-sm">
            {team.website_url && (
              <Item asChild size="sm" className="p-0">
                <Link hideArrow href={team.website_url}>
                  <ItemMedia>
                    <Globe className="size-4" />
                  </ItemMedia>
                  <ItemContent className="hover:underline">
                    {getHost(team.website_url)}
                  </ItemContent>
                </Link>
              </Item>
            )}
            {team.twitter_handle && (
              <Item asChild size="sm" className="p-0">
                <Link
                  hideArrow
                  href={new URL(
                    team.twitter_handle,
                    "https://x.com/"
                  ).toString()}
                >
                  <ItemMedia>
                    <XLogo className="h-3 w-auto" />
                  </ItemMedia>
                  <ItemContent className="hover:underline">
                    {getTwitterHandle(team.twitter_handle)}
                  </ItemContent>
                </Link>
              </Item>
            )}
            {team.github_org && (
              <Item asChild size="sm" className="p-0">
                <Link
                  hideArrow
                  href={new URL(
                    "/" + team.github_org,
                    "https://github.com"
                  ).toString()}
                >
                  <ItemMedia>
                    <GitHubLogo className="size-4" />
                  </ItemMedia>
                  <ItemContent className="hover:underline">
                    {team.github_org}
                  </ItemContent>
                </Link>
              </Item>
            )}
          </div>
        </div>

        {zkvm && (
          <div className="p-4">
            <div className="grid grid-cols-4 gap-4 text-center text-sm">
              <div>
                <div className="text-body-secondary">zkVM</div>
                <div className="font-medium">{zkvm.name}</div>
              </div>
              <div>
                <div className="text-body-secondary">version</div>
                <div className="font-medium">
                  {lastVersion.zkvm_version.version}
                </div>
              </div>
              <div>
                <div className="text-body-secondary">guest</div>
                <div className="font-medium">
                  {cluster.guest_program?.name ?? "—"}
                </div>
              </div>
              <div>
                <div className="text-body-secondary">reproducible</div>
                <div className="font-medium">
                  {isOpenSource || hasBinary ? "yes" : "no"}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-4">
          <Card className="grid grid-cols-2 divide-x divide-border bg-background-accent p-0">
            <div className="px-4 py-3 text-center text-sm">
              <div className="text-body-secondary">avg time</div>
              <div className="text-lg font-medium">
                {hasAvgTime ? prettyMs(cluster.avg_time) : <Null />}
              </div>
            </div>
            <div className="px-4 py-3 text-center text-sm">
              <div className="text-body-secondary">avg cost</div>
              <div className="text-lg font-medium">
                {hasAvgCost ? formatUsd(cluster.avg_cost) : <Null />}
              </div>
            </div>
          </Card>
        </div>

        {zkvm && isUnverifiableZkvm(zkvm.slug) && (
          <aside className="m-4 flex items-center justify-center gap-2 rounded border border-level-worst bg-background-accent px-4 py-3 text-center text-xs text-level-worst">
            disclaimer: this cluster is submitting proofs that cannot be
            independently verified
          </aside>
        )}

        {cluster.software_link && (
          <aside className="m-4 flex items-center justify-center gap-1 rounded bg-accent px-4 py-3 text-center text-xs">
            download the source code or binary
            <Link
              hideArrow
              href={cluster.software_link}
              className="text-sm text-primary hover:text-primary-light"
            >
              here
            </Link>
          </aside>
        )}

        <div className="flex flex-col p-4">
          {(recentProofs?.length ?? 0) > 0 && (
            <DownloadRecentClusterProofsButton
              clusterId={cluster.id}
              limit={RECENT_PROOFS_LIMIT}
              className="mb-4 w-full"
            />
          )}
          <h3 className="mb-3 text-base font-medium">recent proofs</h3>
          <RecentProofs
            isLoading={isLoadingProofs}
            proofs={recentProofs ?? []}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

interface RecentProofsProps {
  isLoading: boolean
  proofs: ProofWithCluster[]
}

function RecentProofs({ isLoading, proofs }: RecentProofsProps) {
  if (isLoading) {
    return (
      <div className="text-sm text-body-secondary">
        loading recent proofs...
      </div>
    )
  }

  if (proofs.length === 0) {
    return <div className="text-sm text-body-secondary">no recent proofs</div>
  }

  return (
    <ItemGroup className="gap-2">
      {proofs.map((proof) => {
        const blockNumber = proof.block?.block_number
        const timestamp = proof.block?.timestamp
        const formattedTimestamp = timestamp
          ? formatTimeAgoDetailed(new Date(timestamp))
          : null
        const provingTime = proof.proving_time
        const timeToProof =
          timestamp &&
          isCompleted(proof) &&
          hasProvedTimestamp(proof) &&
          proof.proved_timestamp
            ? Math.max(
                new Date(proof.proved_timestamp).getTime() -
                  new Date(timestamp).getTime(),
                0
              )
            : null

        return (
          <Item
            key={proof.proof_id}
            variant="outline"
            size="sm"
            className="items-start [&_a]:hover:bg-transparent"
          >
            <ItemContent className="min-w-0">
              {blockNumber !== undefined ? (
                <BlockNumber blockNumber={blockNumber} />
              ) : (
                <Null />
              )}
              {formattedTimestamp && (
                <div className="truncate text-xs text-body-secondary">
                  {formattedTimestamp}
                </div>
              )}
            </ItemContent>
            <ItemContent className="shrink-0 items-end text-right">
              <div
                className={
                  provingTime
                    ? `text-sm ${getProvingTimeColor(provingTime)}`
                    : "text-sm"
                }
              >
                {provingTime ? prettyMs(provingTime) : <Null />}
              </div>
              <div className="text-xs text-body-secondary">proving time</div>
              <div className="mt-1 text-sm">
                {timeToProof ? prettyMs(timeToProof) : <Null />}
              </div>
              <div className="text-xs text-body-secondary">time to proof</div>
            </ItemContent>
            <ProofActions proof={proof} />
          </Item>
        )
      })}
    </ItemGroup>
  )
}

interface ProofActionsProps {
  proof: ProofWithCluster
}

function hasTeam(
  proof: ProofWithCluster
): proof is ProofWithCluster & { team: Team } {
  return proof.team !== undefined
}

function ProofActions({ proof }: ProofActionsProps) {
  if (!hasTeam(proof)) return null

  return (
    <div className="grid w-full grid-cols-2 gap-2 pt-2">
      <DownloadButton proof={proof} className="w-full" />
      <VerifyButton proof={proof} className="w-full" />
    </div>
  )
}

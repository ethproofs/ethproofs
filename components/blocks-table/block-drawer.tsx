"use client"

import { Clock, Cpu, Hourglass, Layers } from "lucide-react"

import type { Block, ProofWithCluster, Team } from "@/lib/types"

import CopyButton from "@/components/copy-button"
import { Null } from "@/components/null"
import DownloadAllButton from "@/components/proof-buttons/download-all-button"
import DownloadButton from "@/components/proof-buttons/download-button"
import { VerifyButton } from "@/components/proof-buttons/verify-button"
import { Card } from "@/components/ui/card"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Item, ItemContent, ItemGroup, ItemTitle } from "@/components/ui/item"
import Link from "@/components/ui/link"
import { Skeleton } from "@/components/ui/skeleton"

import { truncateHash } from "@/lib/utils"

import {
  RTP_PARALYZER_CUTOFF_MINUTES,
  RTP_PERFORMANCE_TIME_THRESHOLD_MS,
} from "@/lib/constants"

import { timestampToEpoch, timestampToSlot } from "@/lib/beaconchain"
import { isMultiGpuCluster } from "@/lib/cluster"
import { formatNumber } from "@/lib/number"
import {
  getProvingTimeStats,
  getTotalTTPStats,
  hasProvedTimestamp,
  isCompleted,
} from "@/lib/proofs"
import { prettyMs } from "@/lib/time"

const PARALYZER_CUTOFF_MS = RTP_PARALYZER_CUTOFF_MINUTES * 60 * 1000

function getProvingTimeColor(provingTime: number): string {
  if (provingTime < RTP_PERFORMANCE_TIME_THRESHOLD_MS) return "text-level-best"
  if (provingTime < PARALYZER_CUTOFF_MS) return "text-level-middle"
  return "text-level-worst"
}

interface BlockDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  block: Block | null
  isLoading?: boolean
}

export function BlockDrawer({
  open,
  onOpenChange,
  block,
  isLoading = false,
}: BlockDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-full w-[420px] overflow-y-auto border-l outline-none focus-visible:outline-none">
        {block ? (
          <BlockDrawerBody block={block} />
        ) : (
          <BlockDrawerSkeleton showSpinner={isLoading} />
        )}
      </DrawerContent>
    </Drawer>
  )
}

interface BlockDrawerBodyProps {
  block: Block
}

function BlockDrawerBody({ block }: BlockDrawerBodyProps) {
  const { block_number, hash, timestamp, gas_used, proofs } = block

  const provingTimeStats = getProvingTimeStats(proofs)
  const totalTTPStats = getTotalTTPStats(proofs, timestamp)
  const provedCount = proofs.filter((p) => p.proof_status === "proved").length
  const totalCount = proofs.length

  const recentProofs = [...proofs].sort((a, b) => {
    const aTime = a.proving_time ?? Number.POSITIVE_INFINITY
    const bTime = b.proving_time ?? Number.POSITIVE_INFINITY
    return aTime - bTime
  })

  const slot = timestamp ? timestampToSlot(timestamp) : null
  const epoch = timestamp ? timestampToEpoch(timestamp) : null
  const displayHash = hash ? truncateHash(hash, 8, 8) : null

  return (
    <>
      <DrawerHeader className="border-b pb-4">
        <div className="flex items-center justify-between gap-4">
          <DrawerTitle
            className="min-w-0 flex-1 truncate text-xl"
            title={`block ${block_number}`}
          >
            block {formatNumber(block_number)}
          </DrawerTitle>
        </div>
        {displayHash && (
          <div className="flex items-center gap-1 text-xs text-body-secondary">
            <span className="truncate font-mono" title={hash ?? undefined}>
              {displayHash}
            </span>
            {hash && (
              <CopyButton
                message={hash}
                className="size-6"
                iconClassName="size-3"
              />
            )}
          </div>
        )}
      </DrawerHeader>

      <div className="border-b p-4">
        <div className="grid grid-cols-2 gap-4 text-center text-sm">
          <BlockStat
            icon={<Clock className="size-3.5" />}
            label="timestamp"
            value={
              timestamp
                ? new Date(timestamp).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : null
            }
          />
          <BlockStat
            icon={<Cpu className="size-3.5" />}
            label="gas used"
            value={gas_used ? formatNumber(gas_used) : null}
          />
          <BlockStat
            icon={<Layers className="size-3.5" />}
            label="slot"
            value={slot !== null ? formatNumber(slot) : null}
          />
          <BlockStat
            icon={<Hourglass className="size-3.5" />}
            label="epoch"
            value={epoch !== null ? formatNumber(epoch) : null}
          />
        </div>
      </div>

      <div className="p-4">
        <Card className="grid grid-cols-3 divide-x divide-border bg-background-accent p-0">
          <div className="px-2 py-3 text-center">
            <div className="text-xs text-body-secondary">best proving time</div>
            <div
              className={
                provingTimeStats
                  ? `text-lg font-medium ${getProvingTimeColor(
                      provingTimeStats.best
                    )}`
                  : "text-lg font-medium"
              }
            >
              {provingTimeStats ? provingTimeStats.bestFormatted : <Null />}
            </div>
          </div>
          <div className="px-2 py-3 text-center">
            <div className="text-xs text-body-secondary">
              best time to proof
            </div>
            <div className="text-lg font-medium">
              {totalTTPStats ? totalTTPStats.bestFormatted : <Null />}
            </div>
          </div>
          <div className="px-2 py-3 text-center">
            <div className="text-xs text-body-secondary">proofs</div>
            <div className="text-lg font-medium">
              {totalCount > 0 ? `${provedCount} / ${totalCount}` : <Null />}
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col p-4">
        {hash && totalCount > 0 && (
          <DownloadAllButton blockHash={hash} className="mb-4 w-full" />
        )}
        <h3 className="mb-3 text-base font-medium">block proofs</h3>
        <RecentProofs
          proofs={recentProofs}
          blockTimestamp={timestamp ?? null}
        />
      </div>
    </>
  )
}

interface BlockDrawerSkeletonProps {
  showSpinner: boolean
}

function BlockDrawerSkeleton({ showSpinner }: BlockDrawerSkeletonProps) {
  return (
    <>
      <DrawerHeader className="border-b pb-4">
        <DrawerTitle className="sr-only">loading block</DrawerTitle>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-2 h-4 w-44" />
      </DrawerHeader>
      <div className="border-b p-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
      <div className="p-4">
        <Skeleton className="h-16 w-full" />
      </div>
      <div className="flex flex-col p-4">
        <Skeleton className="mb-3 h-4 w-24" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
      {!showSpinner && (
        <div className="px-4 pb-4 text-center text-sm text-body-secondary">
          block not found
        </div>
      )}
    </>
  )
}

interface BlockStatProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode | null
}

function BlockStat({ icon, label, value }: BlockStatProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1 text-body-secondary">
        {icon}
        <span>{label}</span>
      </div>
      <div className="font-medium tabular-nums">{value ?? <Null />}</div>
    </div>
  )
}

interface RecentProofsProps {
  proofs: ProofWithCluster[]
  blockTimestamp: string | null
}

function getTimeToProof(
  proof: ProofWithCluster,
  blockTimestamp: string | null
): number | null {
  if (!blockTimestamp) return null
  if (!isCompleted(proof) || !hasProvedTimestamp(proof)) return null
  if (!proof.proved_timestamp) return null
  return Math.max(
    new Date(proof.proved_timestamp).getTime() -
      new Date(blockTimestamp).getTime(),
    0
  )
}

function RecentProofs({ proofs, blockTimestamp }: RecentProofsProps) {
  if (proofs.length === 0) {
    return <div className="text-sm text-body-secondary">no proofs yet</div>
  }

  return (
    <ItemGroup className="gap-2">
      {proofs.map((proof) => {
        const cluster = proof.cluster_version?.cluster
        const team = proof.team
        const provingTime = proof.proving_time
        const timeToProof = getTimeToProof(proof, blockTimestamp)
        const clusterHref = cluster ? `/provers?cluster=${cluster.id}` : null
        const gpuLabel = cluster
          ? isMultiGpuCluster(cluster)
            ? "multi-GPU"
            : "single-GPU"
          : null

        return (
          <Item
            key={proof.proof_id}
            variant="outline"
            size="sm"
            className="items-start [&_a]:hover:bg-transparent"
          >
            <ItemContent className="min-w-0">
              <ItemTitle className="truncate">
                {cluster && clusterHref ? (
                  <Link
                    href={clusterHref}
                    hideArrow
                    className="hover:underline"
                  >
                    {cluster.name}
                  </Link>
                ) : (
                  (cluster?.name ?? <Null />)
                )}
              </ItemTitle>
              {team?.name && (
                <div className="truncate text-xs text-body-secondary">
                  {team.name}
                </div>
              )}
              {gpuLabel && (
                <span className="mt-1 w-fit shrink-0 rounded bg-accent px-1.5 py-0.5 text-[10px] font-medium uppercase text-body-secondary">
                  {gpuLabel}
                </span>
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

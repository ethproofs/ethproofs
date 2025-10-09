import { Cpu } from "lucide-react"

import {
  BlockBase,
  CloudInstanceBase,
  CloudProvider,
  ClusterBase,
  ClusterMachineBase,
  ClusterVersionBase,
  MachineBase,
  ProofBase,
  Team,
  Zkvm,
  ZkvmVersion,
} from "@/lib/types"

import * as Info from "@/components/ui/info"
import Link from "@/components/ui/link"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { TooltipContentHeader } from "@/components/ui/tooltip"

import { cn } from "@/lib/utils"

import DownloadButton from "./proof-buttons/DownloadButton"
import { MetricInfo, MetricLabel, MetricValue } from "./ui/metric"
import { MetricBox } from "./ui/metric"
import { metrics } from "./Metrics"
import Null from "./Null"

import { formatNumber, formatUsd } from "@/lib/number"
import { getProvingCost, hasProvedTimestamp, isCompleted } from "@/lib/proofs"
import { prettyMs } from "@/lib/time"

interface ProofRowProps {
  proof: ProofBase & {
    team: Team
    cluster_version: ClusterVersionBase & {
      cluster: ClusterBase
      zkvm_version: ZkvmVersion & {
        zkvm: Zkvm
      }
      cluster_machines: Array<
        ClusterMachineBase & {
          cloud_instance: CloudInstanceBase & {
            provider: CloudProvider
          }
          machine: MachineBase
        }
      >
    }
  }
  block: BlockBase
}
export function ProofRow({ proof, block }: ProofRowProps) {
  const {
    cluster_version,
    proof_id,
    proving_time,
    proved_timestamp,
    proving_cycles,
    team,
  } = proof

  const isAvailable = isCompleted(proof) && hasProvedTimestamp(proof)

  const timeToProof =
    isAvailable && proved_timestamp && block.timestamp
      ? Math.max(
          new Date(proved_timestamp).getTime() -
            new Date(block.timestamp).getTime(),
          0
        )
      : 0

  const provingCost = getProvingCost(proof)

  const cluster = cluster_version.cluster
  const machines = cluster_version.cluster_machines
  const zkvm = cluster_version.zkvm_version.zkvm

  return (
    <div
      className={cn(
        "grid gap-4 border-b border-border py-4",
        "grid-cols-1",
        "sm:grid-cols-2",
        "lg:grid-cols-[repeat(5,_1fr)_auto] lg:items-center"
      )}
      key={proof_id}
    >
      {/* Team/ZKVM Column */}
      <div className="flex h-full items-center text-left">
        <div className="flex flex-col gap-2">
          {team?.name && (
            <Link
              href={"/teams/" + team?.slug}
              className="text-2xl hover:text-primary-light hover:underline"
            >
              {team.name}
            </Link>
          )}
          {zkvm.name && (
            <span className="text-sm text-primary-light">{zkvm.name}</span>
          )}
        </div>
      </div>

      {/* Time to Proof Column */}
      <MetricBox className="text-left">
        <MetricLabel>
          <MetricInfo label={<metrics.totalTTP.Label />}>
            <TooltipContentHeader>
              <metrics.totalTTP.Label />
            </TooltipContentHeader>
            <metrics.totalTTP.Details />
          </MetricInfo>
        </MetricLabel>
        <MetricValue className="font-normal">
          {isAvailable && timeToProof > 0 ? prettyMs(timeToProof) : <Null />}
        </MetricValue>
      </MetricBox>

      {/* Proving Time Column */}
      <MetricBox className="text-left">
        <MetricLabel>
          <MetricInfo label={<metrics.provingTime.Label />}>
            <TooltipContentHeader>
              <metrics.provingTime.Label />
            </TooltipContentHeader>
            <metrics.provingTime.Details />
          </MetricInfo>
        </MetricLabel>
        <MetricValue className="font-normal">
          {isAvailable && proving_time ? prettyMs(proving_time) : <Null />}
        </MetricValue>
      </MetricBox>

      {/* Cycles Column */}
      <MetricBox className="text-left">
        <MetricLabel>
          <MetricInfo
            label={
              <div>
                <span className="normal-case">{zkvm.name}</span> cycles
              </div>
            }
          >
            <TooltipContentHeader>
              <span className="normal-case">{zkvm.name}</span> cycles
            </TooltipContentHeader>
            <Info.Derivation>
              <Info.Term type="internal">proving cycles</Info.Term>
            </Info.Derivation>
            <p>
              <Info.Term type="internal">proving cycles</Info.Term> is
              self-reported by {team?.name ? team.name : "the proving team"}
            </p>
            <Info.Description>
              The number of cycles used by{" "}
              {team?.name ? team.name : "the proving team"} to generate the
              proof.
            </Info.Description>
            <Info.Description>
              This number will vary depending on hardware and zkVMs being used
              by different provers and should not be directly compared to other
              provers.
            </Info.Description>
          </MetricInfo>
        </MetricLabel>
        <MetricValue
          className="font-normal"
          title={proving_cycles ? formatNumber(proving_cycles) : ""}
        >
          {isAvailable && proving_cycles ? (
            formatNumber(proving_cycles, {
              notation: "compact",
              compactDisplay: "short",
              maximumSignificantDigits: 4,
            })
          ) : (
            <Null />
          )}
        </MetricValue>
      </MetricBox>

      {/* Cost Column */}
      <MetricBox className="text-left">
        <MetricLabel>
          <MetricInfo label={<metrics.costPerProof.Label />}>
            <TooltipContentHeader>
              <metrics.costPerProof.Label />
            </TooltipContentHeader>
            <metrics.costPerProof.Details />
          </MetricInfo>
        </MetricLabel>
        <MetricValue className="font-normal md:flex">
          {isAvailable && provingCost ? (
            <Popover>
              <PopoverTrigger className="flex items-center gap-2">
                {formatUsd(provingCost)} <Cpu className="size-5" />
              </PopoverTrigger>
              {cluster && machines && (
                <PopoverContent>
                  <TooltipContentHeader>
                    {cluster.nickname}
                  </TooltipContentHeader>

                  <div className="space-y-2">
                    {cluster.hardware && <p>hardware: {cluster.hardware}</p>}
                    {cluster.cycle_type && (
                      <p>cycle type: {cluster.cycle_type}</p>
                    )}
                    {cluster.description && (
                      <p>description: {cluster.description}</p>
                    )}
                  </div>

                  <hr className="my-4 bg-body-secondary" />

                  <TooltipContentHeader>cloud equivalency</TooltipContentHeader>

                  <div className="w-fit space-y-4">
                    {machines.map(
                      ({
                        cloud_instance_count,
                        cloud_instance_id,
                        cloud_instance,
                      }) => {
                        const {
                          provider,
                          memory,
                          disk_name,
                          disk_space,
                          instance_name,
                          region,
                          cpu_cores,
                          hourly_price,
                        } = cloud_instance || {}
                        const total_price = hourly_price
                          ? hourly_price * cloud_instance_count
                          : 0
                        return (
                          <div
                            className="flex flex-col divide-y-2 overflow-hidden rounded bg-background"
                            key={cloud_instance_id}
                          >
                            <div className="flex gap-8">
                              <div className="flex-1 space-y-2 p-2">
                                {memory && <p>memory: {memory} GB</p>}
                                {disk_name && (
                                  <p>
                                    storage: {disk_name} {disk_space} GB
                                  </p>
                                )}
                                {instance_name && (
                                  <p>
                                    type: {instance_name} (
                                    {provider.display_name})
                                  </p>
                                )}
                                {region && <p>region: {region}</p>}
                                {cpu_cores && <p>vCPU: {cpu_cores}</p>}
                              </div>
                              {cloud_instance_count && (
                                <div className="grid h-fit place-items-center rounded-bl bg-primary-dark px-4 py-2 text-xl font-bold text-background-highlight">
                                  x{cloud_instance_count}
                                </div>
                              )}
                            </div>
                            {hourly_price && (
                              <div className="p-2">
                                hourly price per instance:{" "}
                                {formatUsd(hourly_price)}
                              </div>
                            )}
                            {total_price && (
                              <div className="p-2">
                                <strong>total hourly price</strong>:{" "}
                                {formatUsd(total_price)}
                              </div>
                            )}
                          </div>
                        )
                      }
                    )}{" "}
                  </div>
                </PopoverContent>
              )}
            </Popover>
          ) : (
            <Null />
          )}
        </MetricValue>
      </MetricBox>

      {/* Download Button Column */}
      <div className="flex items-center justify-center sm:justify-start lg:justify-center">
        <DownloadButton
          proof={proof}
          className="w-full sm:w-40"
          labelClass="hidden sm:inline-block"
          containerClass="flex-row-reverse lg:flex-col-reverse"
        />
      </div>
    </div>
  )
}

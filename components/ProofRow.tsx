import {
  BlockBase,
  ClusterVersion,
  ProofBase,
  Team,
  Zkvm,
  ZkvmVersion,
} from "@/lib/types"

import Cpu from "@/components/svgs/cpu.svg"
import * as Info from "@/components/ui/info"
import Link from "@/components/ui/link"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { TooltipContentHeader } from "@/components/ui/tooltip"

import { cn } from "@/lib/utils"

import { MetricInfo, MetricLabel, MetricValue } from "./ui/metric"
import { MetricBox } from "./ui/metric"
import DownloadButton from "./DownloadButton"
import { metrics } from "./Metrics"
import Null from "./Null"

import { formatNumber, formatUsd } from "@/lib/number"
import { getProvingCost, hasProvedTimestamp, isCompleted } from "@/lib/proofs"
import { prettyMs } from "@/lib/time"

type ProofRowProps = {
  proof: ProofBase & {
    team: Team
    cluster_version: ClusterVersion & {
      zkvm_version: ZkvmVersion & {
        zkvm: Zkvm
      }
    }
  }
  block: BlockBase
}

const ProofRow = ({ proof, block }: ProofRowProps) => {
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
    isAvailable && proved_timestamp
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
        "grid grid-flow-dense grid-cols-4 grid-rows-3",
        "sm:grid-rows-2",
        "md:grid-cols-6-auto md:grid-rows-1"
      )}
      key={proof_id}
    >
      <div
        className={cn(
          "relative flex h-full items-center",
          "col-span-3 col-start-1 row-span-1 row-start-1",
          "sm:col-span-2 sm:col-start-1 sm:row-span-1 sm:row-start-1",
          "md:col-span-1 md:col-start-1 md:row-span-1 md:row-start-1"
        )}
      >
        <div className="flex flex-col gap-2">
          {team?.name && (
            <Link
              href={"/prover/" + team?.id}
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
      <div
        className={cn(
          "ms-auto self-center",
          "col-span-2 col-start-3 row-span-1 row-start-1",
          "sm:col-span-2 sm:col-start-3 sm:row-span-1 sm:row-start-1",
          "md:col-span-1 md:col-start-6 md:row-span-1 md:row-start-1"
        )}
      >
        <DownloadButton
          proof={proof}
          className="sm:max-md:w-40 lg:w-40"
          labelClass="hidden sm:inline-block md:hidden lg:inline-block"
          containerClass="flex-row-reverse md:flex-col-reverse"
        />
      </div>
      <MetricBox
        className={cn(
          "col-span-2 col-start-1 row-span-1 row-start-2",
          "sm:col-span-1 sm:col-start-1 sm:row-span-1 sm:row-start-2",
          "md:col-span-1 md:col-start-2 md:row-span-1 md:row-start-1"
        )}
      >
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
      <MetricBox
        className={cn(
          "col-span-2 col-start-3 row-span-1 row-start-2",
          "sm:col-span-1 sm:col-start-2 sm:row-span-1 sm:row-start-2",
          "md:col-span-1 md:col-start-3 md:row-span-1 md:row-start-1"
        )}
      >
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
      <MetricBox
        className={cn(
          "col-span-2 col-start-1 row-span-1 row-start-3",
          "sm:col-span-1 sm:col-start-3 sm:row-span-1 sm:row-start-2",
          "md:col-span-1 md:col-start-4 md:row-span-1 md:row-start-1"
        )}
      >
        <MetricLabel>
          <MetricInfo
            label={
              <div>
                <span className="normal-case">{team?.name}</span> zk
                <span className="uppercase">VM</span> cycles
              </div>
            }
          >
            <TooltipContentHeader>
              <span className="normal-case">{team?.name}</span> zk
              <span className="uppercase">VM</span> cycles
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
      <MetricBox
        className={cn(
          "col-span-2 col-start-3 row-span-1 row-start-3",
          "sm:col-span-1 sm:col-start-4 sm:row-span-1 sm:row-start-2",
          "md:col-span-1 md:col-start-5 md:row-span-1 md:row-start-1",
          "sm:max-md:text-end"
        )}
      >
        <MetricLabel className="sm:max-md:justify-end">
          <MetricInfo label={<metrics.costPerProof.Label />}>
            <TooltipContentHeader>
              <metrics.costPerProof.Label />
            </TooltipContentHeader>
            <metrics.costPerProof.Details />
          </MetricInfo>
        </MetricLabel>
        <MetricValue className="font-normal">
          {isAvailable && provingCost ? (
            <Popover>
              <PopoverTrigger className="flex items-center gap-2">
                {formatUsd(provingCost)} <Cpu />
              </PopoverTrigger>
              {cluster && machines && (
                <PopoverContent>
                  <TooltipContentHeader>
                    {cluster.nickname}
                  </TooltipContentHeader>

                  <div className="space-y-2">
                    {cluster.hardware && <p>Hardware: {cluster.hardware}</p>}
                    {cluster.cycle_type && (
                      <p>Cycle type: {cluster.cycle_type}</p>
                    )}
                    {cluster.description && <p>{cluster.description}</p>}
                  </div>

                  <hr className="my-4 bg-body-secondary" />

                  <TooltipContentHeader>AWS Equivalency</TooltipContentHeader>

                  <div className="w-fit space-y-4">
                    {machines.map(
                      ({
                        cloud_instance_count,
                        cloud_instance_id,
                        cloud_instance,
                      }) => {
                        const {
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
                                {memory && <p>Memory: {memory} GB</p>}
                                {disk_name && (
                                  <p>
                                    Storage: {disk_name} {disk_space} GB
                                  </p>
                                )}
                                {instance_name && <p>Type: {instance_name}</p>}
                                {region && <p>Region: {region}</p>}
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
                                Hourly price per instance:{" "}
                                {formatUsd(hourly_price)}
                              </div>
                            )}
                            {total_price && (
                              <div className="p-2">
                                <strong>Total hourly price</strong>:{" "}
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
    </div>
  )
}

export default ProofRow

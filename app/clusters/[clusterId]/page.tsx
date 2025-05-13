import { differenceInMilliseconds } from "date-fns"
import { Box, Check, X as RedX } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import prettyBytes from "pretty-bytes"

import { SummaryItem } from "@/lib/types"

import BlockNumber from "@/components/BlockNumber"
import ClusterMachineSummary from "@/components/ClusterMachineSummary"
import { DisplayTeam } from "@/components/DisplayTeamLink"
import DownloadButton from "@/components/DownloadButton"
import KPIs from "@/components/KPIs"
import NoData from "@/components/NoData"
import Null from "@/components/Null"
import CalendarCheck from "@/components/svgs/calendar-check.svg"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "@/components/ui/link"
import MachineDetails from "@/components/ui/MachineDetails"
import { MetricBox, MetricInfo, MetricLabel } from "@/components/ui/metric"
import { Skeleton } from "@/components/ui/skeleton"

import { cn } from "@/lib/utils"

import { getCluster } from "@/lib/api/clusters"
import { fetchProvedProofsByClusterId } from "@/lib/api/proofs"
import { getClusterSummaryById } from "@/lib/api/stats"
import { hasPhysicalMachines, isMultiMachineCluster } from "@/lib/clusters"
import { formatTimeAgo } from "@/lib/date"
import { getMetadata } from "@/lib/metadata"
import { formatUsd } from "@/lib/number"
import { getProvingCost } from "@/lib/proofs"
import { prettyMs } from "@/lib/time"

export type ClusterDetailsPageProps = {
  params: Promise<{ clusterId: string }>
}

export async function generateMetadata({
  params,
}: ClusterDetailsPageProps): Promise<Metadata> {
  const { clusterId } = await params

  let cluster: Awaited<ReturnType<typeof getCluster>>
  try {
    cluster = await getCluster(clusterId)
    if (!cluster) throw new Error()
  } catch {
    return getMetadata({
      title: `cluster ${clusterId} not found`,
    })
  }

  return getMetadata({
    title: cluster.nickname,
  })
}

export default async function ClusterDetailsPage({
  params,
}: ClusterDetailsPageProps) {
  const { clusterId } = await params

  let cluster: Awaited<ReturnType<typeof getCluster>>
  try {
    cluster = await getCluster(clusterId)
    if (!cluster) throw new Error()
  } catch {
    return notFound()
  }

  const [clusterSummary, latestProofs] = await Promise.all([
    getClusterSummaryById(clusterId),
    fetchProvedProofsByClusterId(clusterId),
  ])

  const team = cluster.team
  const lastVersion = cluster.versions[0]
  const zkvm = lastVersion.zkvm_version.zkvm
  const clusterMachines = lastVersion.cluster_machines
  const isMultiMachine = isMultiMachineCluster(clusterMachines)

  // TODO: Replace with killer-block proofs data
  const killerBlockProofs: undefined[] = []

  const hasPhysicalMachinesInCluster = hasPhysicalMachines(clusterMachines)

  const BooleanIcon = ({ bool }: { bool: boolean }) =>
    bool ? (
      <Check
        className="text-level-best"
        strokeLinejoin="miter"
        strokeLinecap="square"
      />
    ) : (
      <RedX className="text-level-worst" strokeLinecap="square" />
    )

  const clusterSummaryItems: SummaryItem[] = [
    {
      key: "open-source",
      label: "open source",
      value: <BooleanIcon bool={cluster.is_open_source} />,
    },
    {
      key: "binary-available",
      label: "binary available",
      value: <BooleanIcon bool={(cluster.software_link || "").length > 0} />,
    },
    {
      key: "avg-cost",
      label: "avg cost",
      value:
        clusterSummary.avg_cost_per_proof !== null &&
        clusterSummary.avg_cost_per_proof > 0 ? (
          formatUsd(clusterSummary.avg_cost_per_proof)
        ) : (
          <Null />
        ),
    },
    {
      key: "avg-time",
      label: "avg time",
      value:
        Number(clusterSummary.avg_proving_time) > 0 ? (
          prettyMs(Number(clusterSummary.avg_proving_time))
        ) : (
          <Null />
        ),
    },
  ]

  return (
    <div className="mx-auto mt-12 max-w-screen-xl space-y-8 px-6 md:mt-24 md:px-8 [&>section]:w-full">
      <div id="hero-section" className="flex flex-col items-center gap-2">
        <h1 className="text-shadow font-mono text-4xl font-semibold">
          {cluster.nickname}
        </h1>

        <div className="text-center font-sans text-sm">
          {cluster.is_multi_machine
            ? "multi-machine cluster"
            : "single machine cluster"}
        </div>
        {team && (
          <DisplayTeam
            team={team}
            className="mt-4 block border-t border-primary p-6"
            height={36}
            hideDot
          />
        )}
      </div>

      {/* TODO: Refactor to use Card */}
      <Card className="mx-auto w-fit">
        <KPIs items={clusterSummaryItems} layout="flipped" />
      </Card>

      {cluster.software_link && (
        <aside className="flex items-center justify-center gap-2 rounded bg-background-accent px-6 py-4 text-center">
          download the binary
          <Link
            href={cluster.software_link}
            className="text-primary-light hover:underline"
          >
            here
          </Link>
        </aside>
      )}

      <section className="!mt-16 flex w-full flex-wrap justify-evenly gap-x-8 border-b">
        <div className="flex flex-col items-center gap-1 p-4">
          <div className="font-sans text-sm text-body-secondary">zkVM</div>
          <div className="font-mono text-lg text-primary">{zkvm.name}</div>
        </div>
        <div className="flex flex-col items-center gap-1 p-4">
          <MetricBox className="py-0">
            <MetricLabel>
              <MetricInfo label="ISA">
                Instruction Set Architecture
                <br />
                TODO: Popover details
              </MetricInfo>
            </MetricLabel>
          </MetricBox>
          <div className="font-mono text-lg text-primary">{zkvm.isa}</div>
        </div>
        <div className="flex flex-col items-center gap-1 p-4">
          <div className="font-sans text-sm text-body-secondary">
            proof type
          </div>
          <div className="font-mono text-lg text-primary">
            {cluster.proof_type}
          </div>
        </div>
      </section>

      {hasPhysicalMachinesInCluster && (
        <section className="flex gap-x-16 gap-y-8 max-sm:flex-col max-sm:items-center">
          {isMultiMachine && (
            <ClusterMachineSummary machines={clusterMachines} />
          )}

          <div
            className={cn(
              "flex gap-8 overflow-x-auto overflow-y-visible",
              !isMultiMachine && "mx-auto"
            )}
          >
            {clusterMachines
              .sort((a, b) => b.machine_count - a.machine_count)
              .map((clusterMachine) => (
                <div
                  key={clusterMachine.id}
                  className="relative flex flex-col justify-end -space-y-4"
                >
                  <MachineDetails
                    machine={clusterMachine.machine}
                    className="rounded-2xl border border-primary-border bg-background px-8"
                  />
                  {Array.from({ length: clusterMachine.machine_count - 1 }).map(
                    (_, i) => (
                      <div
                        key={i}
                        className="h-6 rounded-b-2xl border border-primary-border border-t-transparent"
                      />
                    )
                  )}
                  <div className="!mt-2 inline-flex justify-center">
                    <MetricBox className="py-0">
                      <MetricLabel>
                        <MetricInfo
                          label={`${clusterMachine.machine_count} machines @ ${formatUsd(
                            clusterMachine.cloud_instance.hourly_price
                          )}/h`}
                        >
                          TODO: Popover details
                        </MetricInfo>
                      </MetricLabel>
                    </MetricBox>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* // TODO: Mobile responsiveness */}
      <section className="flex flex-col">
        <div className="flex items-center gap-2 px-6">
          <Box strokeWidth="1" className="size-11" />
          <div className="font-mono text-xl">latest proofs</div>
        </div>
        {latestProofs.length ? (
          latestProofs.map((proof, i) => {
            const costPerProof = getProvingCost(proof)
            const costPerMgas = costPerProof
              ? costPerProof / (proof.block.gas_used / 1e6)
              : null

            return (
              <div
                key={i}
                className="grid grid-cols-[1fr_repeat(4,_auto)] gap-x-6 border-b border-primary-border p-6"
              >
                <div className="col-start-1 row-span-2 grid grid-cols-1 grid-rows-subgrid">
                  <BlockNumber blockNumber={proof.block_number} />
                  <div className="font-sans text-xs text-body-secondary">
                    {proof.proved_timestamp ? (
                      formatTimeAgo(proof.proved_timestamp)
                    ) : (
                      <Null />
                    )}
                  </div>
                </div>
                <div className="col-start-2 row-span-2 grid grid-cols-1 grid-rows-subgrid place-items-center">
                  <div className="font-mono text-sm">
                    proving:{" "}
                    {proof.proving_time ? (
                      prettyMs(proof.proving_time)
                    ) : (
                      <Null />
                    )}
                  </div>
                  <div className="font-sans text-xs text-body-secondary">
                    total to proof:{" "}
                    {proof.proved_timestamp ? (
                      prettyMs(
                        differenceInMilliseconds(
                          new Date(proof.proved_timestamp),
                          new Date(proof.block.timestamp)
                        )
                      )
                    ) : (
                      <Null />
                    )}
                  </div>
                </div>
                <div className="col-start-3 row-span-2 grid grid-cols-1 grid-rows-subgrid place-items-center">
                  <div className="font-mono text-sm">
                    per proof:{" "}
                    {costPerProof ? formatUsd(costPerProof) : <Null />}
                  </div>
                  <div className="font-sans text-xs text-body-secondary">
                    per Mgas: {costPerMgas ? formatUsd(costPerMgas) : <Null />}
                  </div>
                </div>
                <DownloadButton
                  proof={proof}
                  containerClass="col-start-4 row-span-2 grid grid-cols-1 grid-rows-subgrid place-items-center"
                />
                <div className="col-start-5 row-span-2 grid grid-cols-1 grid-rows-subgrid place-items-center">
                  <Button disabled variant="solid" className="w-full p-0">
                    <CalendarCheck className="text-lg" />
                    verify
                  </Button>
                  <div className="text-center font-sans text-xs text-body-secondary">
                    in-browser verification
                    <br />
                    (soon)
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <NoData>for this cluster</NoData>
        )}
      </section>

      {/* // TODO: Mobile responsiveness */}
      <section className="flex flex-col">
        <div className="flex items-center gap-2 px-6">
          <Box strokeWidth="1" className="size-11" />
          <div className="font-mono text-xl">killer-block proofs</div>
        </div>
        {/* // TODO: Replace with killer-block proofs data */}
        {killerBlockProofs.length ? (
          killerBlockProofs.map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_repeat(4,_auto)] gap-x-6 border-b border-primary-border p-6"
            >
              <div className="col-start-1 row-span-2 grid grid-cols-1 grid-rows-subgrid">
                <div className="font-mono text-lg text-primary">222566340</div>
                <div className="font-sans text-xs text-body-secondary">
                  {formatTimeAgo(new Date(Date.now() - 1000 * 60 * 6))}
                </div>
              </div>
              <div className="col-start-2 row-span-2 grid grid-cols-1 grid-rows-subgrid place-items-center">
                <div className="font-mono text-sm">
                  proving: {prettyMs(204_000)}
                </div>
                <div className="font-sans text-xs text-body-secondary">
                  total to proof: {prettyMs(350_000)}
                </div>
              </div>
              <div className="col-start-3 row-span-2 grid grid-cols-1 grid-rows-subgrid place-items-center">
                <div className="font-mono text-sm">
                  per proof:{" "}
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumSignificantDigits: 2,
                    maximumSignificantDigits: 3,
                  }).format(0.0556)}
                </div>
                <div className="font-sans text-xs text-body-secondary">
                  per Mgas:{" "}
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumSignificantDigits: 2,
                    maximumSignificantDigits: 3,
                  }).format(0.0024)}
                </div>
              </div>
              <div className="col-start-4 row-span-2 grid grid-cols-1 grid-rows-subgrid place-items-center">
                <div className="REMOVE opacity-10">
                  <Skeleton className="h-8 w-32 rounded-full border border-primary">
                    download TODO
                  </Skeleton>
                </div>
                {/* // TODO: Re-enable and pass proof when available */}
                {/* <DownloadButton proof={undefined} /> */}
                <div className="font-sans text-xs text-body-secondary">
                  ({prettyBytes(3_500_000)})
                </div>
              </div>
              <div className="col-start-5 row-span-2 grid grid-cols-1 grid-rows-subgrid place-items-center">
                <Button disabled variant="solid" className="w-full p-0">
                  <CalendarCheck className="text-lg" />
                  verify
                </Button>
                <div className="font-sans text-xs text-body-secondary">
                  in-browser verification
                </div>
              </div>
            </div>
          ))
        ) : (
          <NoData>for this cluster</NoData>
        )}
      </section>
    </div>
  )
}

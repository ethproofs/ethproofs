import { Box, Check, X as RedX } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { SummaryItem } from "@/lib/types"

import ClusterMachineSummary from "@/components/ClusterMachineSummary"
import ClusterProofRow, { type RowProof } from "@/components/ClusterProofRow"
import { DisplayTeam } from "@/components/DisplayTeamLink"
import KPIs from "@/components/KPIs"
import NoData from "@/components/NoData"
import Null from "@/components/Null"
import { Card } from "@/components/ui/card"
import Link from "@/components/ui/link"
import MachineDetails from "@/components/ui/MachineDetails"
import { MetricBox, MetricInfo, MetricLabel } from "@/components/ui/metric"

import { cn } from "@/lib/utils"

import { getCluster } from "@/lib/api/clusters"
import { fetchProvedProofsByClusterId } from "@/lib/api/proofs"
import { getClusterSummaryById } from "@/lib/api/stats"
import { hasPhysicalMachines, isMultiMachineCluster } from "@/lib/clusters"
import { getMetadata } from "@/lib/metadata"
import { formatUsd } from "@/lib/number"
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
  const killerBlockProofs = [] as RowProof[]

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
    <div className="mx-auto mt-16 max-w-screen-xl space-y-8 px-6 md:mt-24 md:px-8 [&>section]:w-full">
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
                          label={`${clusterMachine.machine_count} machine${clusterMachine.machine_count === 1 ? "" : "s"} @ ${formatUsd(
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

      <section className="flex flex-col">
        <div className="flex items-center gap-2 px-6">
          <Box strokeWidth="1" className="size-11" />
          <div className="font-mono text-xl">latest proofs</div>
        </div>
        {latestProofs.length ? (
          latestProofs.map((proof) => (
            <ClusterProofRow key={proof.proof_id} proof={proof} />
          ))
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
        {killerBlockProofs.length ? (
          killerBlockProofs.map((proof) => (
            <ClusterProofRow key={proof.proof_id} proof={proof} />
          ))
        ) : (
          <NoData>for this cluster</NoData>
        )}
      </section>
    </div>
  )
}

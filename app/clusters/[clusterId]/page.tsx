import { Check, X as RedX } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { SummaryItem } from "@/lib/types"

import KPIs from "@/components/KPIs"
import { Null } from "@/components/Null"
import { ClusterProofsSection } from "@/components/proofs-table/cluster-proofs-section"
import { DisplayTeam } from "@/components/team-logo-link"
import { Card } from "@/components/ui/card"
import Link from "@/components/ui/link"
import { MetricBox, MetricInfo, MetricLabel } from "@/components/ui/metric"
import { TooltipContentHeader } from "@/components/ui/tooltip"

import { getCluster } from "@/lib/api/clusters"
import { getClusterSummaryById } from "@/lib/api/stats"
import { isMultiGpuCluster } from "@/lib/cluster"
import { getMetadata } from "@/lib/metadata"
import { formatUsd } from "@/lib/number"
import { prettyMs } from "@/lib/time"
import { isUnverifiableZkvm } from "@/lib/zkvms"

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
    title: cluster.name,
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

  const clusterSummary = await getClusterSummaryById(clusterId)

  const team = cluster.team
  const lastVersion = cluster.versions[0]
  const zkvm = lastVersion.zkvm_version.zkvm

  const BooleanIcon = ({ bool }: { bool: boolean }) =>
    bool ? (
      <Check className="text-level-best" />
    ) : (
      <RedX className="text-level-worst" />
    )

  const clusterSummaryItems: SummaryItem[] = [
    {
      key: "open-source",
      label: "prover open source",
      value: <BooleanIcon bool={cluster.is_open_source} />,
    },
    {
      key: "binary-available",
      label: "binary available",
      value: <BooleanIcon bool={(cluster.software_link || "").length > 0} />,
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
  ]

  return (
    <div className="mx-auto mt-12 max-w-screen-xl space-y-8 px-6 md:px-8 [&>section]:w-full">
      <div id="hero-section" className="flex flex-col items-center gap-2">
        <h1 className="text-4xl font-semibold">{cluster.name}</h1>

        <div className="text-center font-sans text-sm">
          {isMultiGpuCluster(cluster)
            ? "multi-GPU cluster"
            : "single-GPU cluster"}
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

      <Card className="mx-auto w-fit p-6">
        <KPIs items={clusterSummaryItems} layout="flipped" />
      </Card>

      {isUnverifiableZkvm(zkvm.slug) && (
        <aside className="flex items-center justify-center gap-2 rounded border border-level-worst bg-background-accent px-6 py-4 text-center text-level-worst">
          disclaimer: this cluster is submitting proofs that cannot be
          independently verified
        </aside>
      )}

      {cluster.software_link && (
        <aside className="flex items-center justify-center gap-2 rounded bg-accent px-6 py-4 text-center">
          download the binary or source code
          <Link
            href={cluster.software_link}
            className="text-primary hover:text-primary-light"
          >
            here
          </Link>
        </aside>
      )}

      <section className="mt-12 flex w-full flex-wrap justify-evenly gap-x-8">
        <div className="flex flex-col items-center gap-1 p-4">
          <div className="font-sans text-sm text-body-secondary">zkVM</div>
          <div className="text-lg text-primary">{zkvm.name}</div>
        </div>
        <div className="flex flex-col items-center gap-1 p-4">
          <div className="font-sans text-sm text-body-secondary">version</div>
          <div className="text-lg text-primary">
            {lastVersion.zkvm_version.version}
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 p-4">
          <MetricBox className="py-0">
            <MetricLabel>
              <MetricInfo label="ISA">
                <TooltipContentHeader>
                  Instruction Set Architecture (ISA)
                </TooltipContentHeader>
                Defines the instruction set this zkVM implements to generate
                zero-knowledge proofs for Ethereum transactions. The ISA
                determines which EVM operations can be efficiently proven and
                verified on-chain.
              </MetricInfo>
            </MetricLabel>
          </MetricBox>
          <div className="text-lg text-primary">{zkvm.isa}</div>
        </div>
        <div className="flex flex-col items-center gap-1 p-4">
          <div className="font-sans text-sm text-body-secondary">
            proof type
          </div>
          <div className="text-lg text-primary">STARK</div>
        </div>
      </section>

      <section>
        <span className="text-2xl">latest proofs</span>
        <ClusterProofsSection clusterId={clusterId} className="mt-4" />
      </section>
    </div>
  )
}

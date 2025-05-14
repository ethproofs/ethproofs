import { Box } from "lucide-react"
import { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"

import ClusterAccordion from "@/components/ClusterAccordion"
import { DisplayTeamLink } from "@/components/DisplayTeamLink"
import SoftwareDetails from "@/components/SoftwareDetails"
import GitHub from "@/components/svgs/github.svg"
import Link from "@/components/ui/link"

import { getActiveClusters } from "@/lib/api/clusters"
import { getClusterSummary } from "@/lib/api/stats"
import { getZkvm } from "@/lib/api/zkvms"
import { formatShortDate } from "@/lib/date"
import { getMetadata } from "@/lib/metadata"
import { getSoftwareDetailItems, getZkvmMetrics } from "@/lib/metrics"
import { getZkvmWithUsage } from "@/lib/zkvms"

export type ZkvmDetailsPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: ZkvmDetailsPageProps): Promise<Metadata> {
  const { slug } = await params

  let zkvm: Awaited<ReturnType<typeof getZkvm>>
  try {
    zkvm = await getZkvm({ slug })
    if (!zkvm) throw new Error()
  } catch {
    return getMetadata({ title: "zkVM not found" })
  }

  return getMetadata({
    title: `zkVM ${zkvm.name}`,
  })
}

export default async function ZkvmDetailsPage({
  params,
}: ZkvmDetailsPageProps) {
  const slug = (await params).slug

  let zkvm: Awaited<ReturnType<typeof getZkvmWithUsage>>
  try {
    zkvm = await getZkvmWithUsage({ slug })
    if (!zkvm) throw new Error()
  } catch {
    return notFound()
  }

  const [activeClusters, clusterSummary, zkvmMetrics] = await Promise.all([
    getActiveClusters({ zkvmId: zkvm.id }),
    getClusterSummary(),
    getZkvmMetrics(zkvm.id),
  ])

  const clusters = activeClusters.map((cluster) => {
    const stats = clusterSummary.find(
      (summary) => summary.cluster_id === cluster.id
    )

    return {
      ...cluster,
      avg_cost: stats?.avg_cost_per_proof ?? 0,
      avg_time: Number(stats?.avg_proving_time ?? 0),
    }
  })

  return (
    <>
      <div className="mb-24 mt-16 space-y-4 px-6 text-center font-mono md:mt-24 md:px-8">
        <h1 className="text-shadow text-3xl font-semibold">{zkvm.name}</h1>

        <div className="flex items-center justify-center gap-3">
          <span className="inline-block font-mono italic text-body-secondary">
            by
          </span>
          <DisplayTeamLink team={zkvm.vendor} height={24} />
        </div>
      </div>

      <div className="mx-auto mb-20 grid w-fit max-w-screen-xl grid-cols-1 gap-x-20 gap-y-8 max-sm:gap-y-4 sm:grid-cols-2 md:px-24 lg:grid-cols-4">
        <div className="row-span-2 grid grid-cols-subgrid place-items-center gap-y-1 text-nowrap">
          <div className="text-body-secondary">latest version</div>
          <div className="">{zkvm.versions[0].version}</div>
        </div>
        <div className="row-span-2 grid grid-cols-subgrid place-items-center gap-y-1 text-nowrap">
          <div className="text-body-secondary">release date</div>
          <div className="uppercase">
            {zkvm.versions[0].release_date
              ? formatShortDate(new Date(zkvm.versions[0].release_date))
              : "N/A"}
          </div>
        </div>
        <div className="row-span-2 grid grid-cols-subgrid place-items-center gap-y-1 text-nowrap">
          <div className="text-body-secondary">ISA</div>
          <div className="uppercase">{zkvm.isa}</div>
        </div>
        <div className="row-span-2 grid grid-cols-subgrid place-items-center gap-y-1 text-nowrap">
          <div className="text-body-secondary">official repository</div>
          <div className="flex items-center gap-2">
            <GitHub className="text-2xl" />{" "}
            <Link href={zkvm.repo_url} className="hover:underline">
              {new URL(zkvm.repo_url).pathname.replace(/^\//, "")}
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-b from-background to-background-active">
        <div className="mx-auto max-w-screen-xl">
          <h2 className="sr-only">zkVM software details</h2>
          <SoftwareDetails detailItems={getSoftwareDetailItems(zkvmMetrics)} />
        </div>
      </div>

      <div className="mx-auto max-w-screen-xl">
        <section className="mx-6 mt-40 px-6 md:mx-auto md:px-8">
          <h2 className="flex items-center gap-2 font-mono text-lg font-normal text-primary">
            <Box className="size-11 text-primary" strokeWidth="1" />
            active clusters using {zkvm.name}: {zkvm.activeClusters} /{" "}
            {zkvm.totalClusters}
          </h2>
          <div className="-me-6 overflow-x-auto pe-6">
            <ClusterAccordion clusters={clusters} />
          </div>
        </section>
      </div>
    </>
  )
}

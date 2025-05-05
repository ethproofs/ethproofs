import { Box } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import ClusterAccordion from "@/components/ClusterAccordion"
import SoftwareDetails from "@/components/SoftwareDetails"
import GitHub from "@/components/svgs/github.svg"

import { cn } from "@/lib/utils"

import { getActiveClusters } from "@/lib/api/clusters"
import { getClusterSummary } from "@/lib/api/stats"
import { getZkvm } from "@/lib/api/zkvms"
import { formatShortDate } from "@/lib/date"
import { getMetadata } from "@/lib/metadata"
import { getZkvmMetrics, getZkvmMetricSeverityLevels } from "@/lib/metrics"
import { getZkvmWithUsage } from "@/lib/zkvms"

type ZkvmDetailsPageProps = {
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

  const activeClusters = await getActiveClusters()
  const clusterSummary = await getClusterSummary()
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

  const zkvmMetrics = await getZkvmMetrics(zkvm.id)
  const severityLevels = getZkvmMetricSeverityLevels(zkvmMetrics)

  return (
    <>
      <div className="absolute top-16 w-full space-y-4 px-6 text-center font-mono sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <h1
          className="text-3xl font-semibold"
          style={{
            textShadow: `
              0 0 3rem hsla(var(--background-modal)),
              0 0 2rem hsla(var(--background-modal)),
              0 0 1rem hsla(var(--background-modal)),
              0 0 1rem hsla(var(--background-modal))`,
          }}
        >
          {zkvm.name}
        </h1>

        <div className="flex items-center justify-center gap-3">
          <span className="inline-block font-mono italic text-body-secondary">
            by
          </span>
          <Link
            href={`/prover/${zkvm.vendor.slug}`}
            className="inline-block rounded p-1 hover:bg-primary/10"
          >
            <Image
              // TODO: Add fallback image
              src={zkvm.vendor.logo_url ?? ""}
              alt={`${zkvm.vendor.name} logo`}
              height={16}
              width={16}
              style={{ height: "1.5rem", width: "auto" }}
              className="dark:invert"
            />
            <span className="sr-only">{zkvm.vendor.name}</span>
          </Link>
        </div>
      </div>

      <div
        className={cn(
          "mb-20 grid grid-cols-1 gap-y-8 max-sm:gap-y-4 sm:grid-cols-2 lg:grid-cols-4",
          "w-fit md:w-[calc(100vw_-_var(--sidebar-width))]",
          "mx-auto gap-x-20 md:px-24"
        )}
      >
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

      <div
        className={cn(
          "bg-gradient-to-b from-background to-background-active",
          "w-fit md:w-[calc(100vw_-_var(--sidebar-width))]",
          "mx-auto gap-x-20 md:px-24"
        )}
      >
        <h2 className="sr-only">zkVM software details</h2>
        <SoftwareDetails
          numericMetrics={{
            verification_ms: zkvmMetrics.verification_ms,
            size_bytes: zkvmMetrics.size_bytes,
          }}
          categoricalMetrics={{
            ...zkvmMetrics,
            security_target_bits: severityLevels[0],
            max_bounty_amount: severityLevels[3],
          }}
          severityLevels={severityLevels}
        />
      </div>

      <div className="mx-6 mt-40 max-w-full gap-x-20 md:mx-auto md:w-[calc(100vw_-_var(--sidebar-width))] md:px-[5vw]">
        <h2 className="flex items-center gap-2 font-mono text-lg font-normal text-primary">
          <Box className="size-11 text-primary" strokeWidth="1" />
          active clusters using {zkvm.name}: {zkvm.activeClusters} /{" "}
          {zkvm.totalClusters}
        </h2>
        <div className="-me-6 overflow-x-auto pe-6">
          <ClusterAccordion clusters={clusters} />
        </div>
      </div>
    </>
  )
}

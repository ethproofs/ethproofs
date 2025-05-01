import { Check, X as RedX } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { Cluster } from "@/lib/types"

import { getClusterById } from "@/lib/api/clusters"
import { getMetadata } from "@/lib/metadata"
import { prettyMs } from "@/lib/time"

export type ClusterDetailsPageProps = {
  params: Promise<{ clusterId: string }>
}

export async function generateMetadata({
  params,
}: ClusterDetailsPageProps): Promise<Metadata> {
  const { clusterId } = await params

  let cluster: Cluster | undefined
  try {
    cluster = (await getClusterById(clusterId)) as Cluster
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

  let cluster: Cluster | undefined
  try {
    cluster = (await getClusterById(clusterId)) as Cluster
    if (!cluster) throw new Error()
  } catch {
    return notFound()
  }

  return (
    <div className="-mt-52 px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
      <div id="hero-section" className="flex flex-col items-center gap-2 p-20">
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
          {cluster.nickname}
        </h1>

        <div className="text-center font-sans text-sm">
          {/* // TODO: Differentiate single vs multi */}
          single machine cluster
        </div>
      </div>

      <div className="relative flex flex-wrap rounded-[1.25rem] bg-background p-6">
        <div className="absolute -inset-px z-[-2] rounded-[calc(1.25rem_+_1px)] bg-gradient-to-tl from-primary to-primary/10" />
        <div className="absolute -inset-px z-[-1] rounded-[1.25rem] bg-black/10" />
        <div className="flex flex-col items-center gap-3 p-4">
          <div className="font-sans text-sm font-semibold">open source</div>
          <RedX className="text-level-worst" strokeLinecap="square" />
        </div>
        <div className="flex flex-col items-center gap-3 p-4">
          <div className="font-sans text-sm font-semibold">
            binary available
          </div>
          <Check
            className="text-level-best"
            strokeLinejoin="miter"
            strokeLinecap="square"
          />
        </div>
        <div className="flex flex-col items-center gap-3 p-4">
          <div className="font-sans text-sm font-semibold">avg cost</div>
          <div className="font-mono text-xl font-semibold text-primary">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumSignificantDigits: 2,
            }).format(0.0056)}
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 p-4">
          <div className="font-sans text-sm font-semibold">avg time</div>
          <div className="font-mono text-xl font-semibold text-primary">
            {prettyMs(277_000)}
          </div>
        </div>
      </div>
    </div>
  )
}

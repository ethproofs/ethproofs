import { Check, X as RedX } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"

import { ClusterDetails } from "@/lib/types"

// import ClusterMachineSummary from "@/components/ClusterMachineSummary"
import Link from "@/components/ui/link"
import MachineDetails from "@/components/ui/MachineDetails"
import { MetricBox, MetricInfo, MetricLabel } from "@/components/ui/metric"
import { Skeleton } from "@/components/ui/skeleton"

import { getCluster } from "@/lib/api/clusters"
import { getTeam } from "@/lib/api/teams"
import { getMetadata } from "@/lib/metadata"
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

  let team: Awaited<ReturnType<typeof getTeam>>
  try {
    team = await getTeam(cluster.team_id)
    if (!team) throw new Error()
  } catch {
    console.warn("Failed to fetch team for cluster", clusterId)
  }

  const demoMachines: ClusterDetails["machines"] = [
    {
      id: 1,
      cpuModel: "SeePeeYou",
      cpuCount: 1,
      cpuRam: 64, // gb
      gpuCount: [4, 8],
      gpuModels: ["hello", "world"],
      gpuRam: [64, 128], // gb
      count: 2,
    },
    {
      id: 2,
      cpuModel: "SeePeeYou2",
      cpuCount: 2,
      cpuRam: 64, // gb
      gpuCount: [4, 8],
      gpuModels: ["hello", "world"],
      gpuRam: [64, 128], // gb
      count: 32,
    },
    {
      id: 3,
      cpuModel: "SeePeeYou3",
      cpuCount: 3,
      cpuRam: 64, // gb
      gpuCount: [4, 8],
      gpuModels: ["hello", "world"],
      gpuRam: [64, 128], // gb
      count: 16,
    },
    {
      id: 4,
      cpuModel: "SeePeeYou",
      cpuCount: 4,
      cpuRam: 64, // gb
      gpuCount: [4, 8],
      gpuModels: ["hello", "world"],
      gpuRam: [64, 128], // gb
      count: 2,
    },
    {
      id: 5,
      cpuModel: "SeePeeYou2",
      cpuCount: 5,
      cpuRam: 64, // gb
      gpuCount: [4, 8],
      gpuModels: ["hello", "world"],
      gpuRam: [64, 128], // gb
      count: 4,
    },
    {
      id: 6,
      cpuModel: "SeePeeYou3",
      cpuCount: 6,
      cpuRam: 64, // gb
      gpuCount: [4, 8],
      gpuModels: ["hello", "world"],
      gpuRam: [64, 128], // gb
      count: 8,
    },
  ]

  return (
    <div className="-mt-52 w-full space-y-8 px-6 sm:px-8 md:w-[calc(100vw_-_var(--sidebar-width))] md:px-12 lg:px-16 xl:px-20">
      <div id="hero-section" className="flex flex-col items-center gap-2 pt-20">
        <h1
          className="font-mono text-4xl font-semibold"
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
        {team && (
          <div className="mx-auto mt-4 flex w-full max-w-lg justify-center border-t border-primary p-6">
            {team.logo_url ? (
              <Image
                src={team.logo_url}
                alt={`${team.name} logo`}
                width={100}
                height={100}
                className="dark:invert"
              />
            ) : (
              <div className="text-xl">{team.name}</div>
            )}
          </div>
        )}
      </div>

      <div className="relative mx-auto flex w-fit flex-wrap justify-evenly gap-x-8 rounded-[1.25rem] bg-background p-6">
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

      <aside className="flex items-center justify-center gap-2 rounded bg-background-accent px-6 py-4 text-center">
        download the binary
        <Link
          href="/zkvk/TODO"
          className="text-//primary-light hover:underline"
        >
          here
        </Link>
      </aside>

      <div className="!mt-16 flex w-full flex-wrap justify-evenly gap-x-8 border-b">
        <div className="flex flex-col items-center gap-1 p-4">
          <div className="font-sans text-sm text-body-secondary">zkVM</div>
          <div className="font-mono text-lg text-primary">SP1!</div>
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
          <div className="font-mono text-lg text-primary">RISC-V!</div>
        </div>
        <div className="flex flex-col items-center gap-1 p-4">
          <div className="font-sans text-sm text-body-secondary">
            proof type
          </div>
          <div className="font-mono text-lg text-primary">hash-based</div>
        </div>
      </div>

      {/* <div className="flex gap-20"> */}
      <div className="grid grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))] gap-8">
        {/* // TODO: Re-enable when clusterDetails available for single cluster */}
        {/* <ClusterMachineSummary clusterDetails={clusterDetails} /> */}
        <Skeleton className="me-16 h-80 w-48 rounded-2xl opacity-10" />

        {demoMachines
          .sort((a, b) => b.count - a.count)
          .map((machine) => (
            <div key={machine.id}>
              <MachineDetails
                machine={machine}
                className="z-0 rounded-2xl border border-primary-border bg-background"
              />
              {/* // TODO: Fix extra space in layout from stacked card effect */}
              {Array.from({ length: machine.count - 1 }).map((_, i) => (
                <div
                  key={i}
                  className="relative h-6 rounded-b-2xl border border-primary-border border-t-transparent"
                  style={{ bottom: `${i + 1}rem` }}
                />
              ))}
              <div
                className="relative h-6"
                style={{ bottom: `${machine.count - 1.5}rem` }}
              >
                <MetricBox className="py-0">
                  <MetricLabel>
                    <MetricInfo
                      label={`${machine.count} machines @ ${new Intl.NumberFormat(
                        "en-US",
                        {
                          style: "currency",
                          currency: "USD",
                          minimumSignificantDigits: 2,
                        }
                      ).format(0.61)}/h`}
                    >
                      TODO: Popover details
                    </MetricInfo>
                  </MetricLabel>
                </MetricBox>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

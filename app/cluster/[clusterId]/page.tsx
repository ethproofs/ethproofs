import { Box, Check, Download, X as RedX } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import prettyBytes from "pretty-bytes"

import { ClusterDetails } from "@/lib/types"

import DownloadButton from "@/components/DownloadButton"
import CalendarCheck from "@/components/svgs/calendar-check.svg"
import { Button } from "@/components/ui/button"
// import ClusterMachineSummary from "@/components/ClusterMachineSummary"
import Link from "@/components/ui/link"
import MachineDetails from "@/components/ui/MachineDetails"
import { MetricBox, MetricInfo, MetricLabel } from "@/components/ui/metric"
import { Skeleton } from "@/components/ui/skeleton"

import { getCluster } from "@/lib/api/clusters"
import { getTeam } from "@/lib/api/teams"
import { formatTimeAgo } from "@/lib/date"
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
      gpuCount: [4, 8, 16],
      gpuModels: ["hello", "world", "hola"],
      gpuRam: [64, 128, 256], // gb
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

      <section className="flex max-w-full">
        {/* // TODO: Re-enable when clusterDetails available for single cluster */}
        {/* <ClusterMachineSummary clusterDetails={clusterDetails} /> */}
        <div className="opacity-10">
          <Skeleton className="me-16 h-80 min-w-48 rounded-2xl" />
        </div>

        <div className="flex gap-8 overflow-x-auto overflow-y-visible">
          {demoMachines
            .sort((a, b) => b.count - a.count)
            .map((machine) => (
              <div
                key={machine.id}
                className="relative flex flex-col justify-end -space-y-4"
              >
                <MachineDetails
                  machine={machine}
                  className="rounded-2xl border border-primary-border bg-background px-8"
                />
                {Array.from({ length: machine.count - 1 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-6 rounded-b-2xl border border-primary-border border-t-transparent"
                  />
                ))}
                <div className="!mt-2 inline-flex justify-center">
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
      </section>

      {/* // TODO: Mobile responsiveness */}
      <section className="flex max-w-full flex-col">
        <div className="flex items-center gap-2 px-6">
          <Box strokeWidth="1" className="size-11" />
          <div className="font-mono text-xl">latest proofs</div>
        </div>
        {/* // TODO: Replace with latest proof data */}
        {Array.from({ length: 6 }).map((_, i) => (
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
              <div className="REMOVE inline-flex h-8 w-32 justify-center rounded-full border border-primary opacity-10">
                download
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
        ))}
      </section>

      {/* TODO: Mobile responsiveness */}
      <section className="flex max-w-full flex-col">
        <div className="flex items-center gap-2 px-6">
          <Box strokeWidth="1" className="size-11" />
          <div className="font-mono text-xl">killer-block proofs</div>
        </div>
        {/* // TODO: Replace with killer-block proofs data */}
        {Array.from({ length: 6 }).map((_, i) => (
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
        ))}
      </section>
    </div>
  )
}

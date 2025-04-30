import { type Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { QueryClient } from "@tanstack/react-query"

import type { Team } from "@/lib/types"

import ClusterTable from "@/components/ClusterTable"
import MachineTabs from "@/components/MachineTabs"
import GitHub from "@/components/svgs/github.svg"
import Globe from "@/components/svgs/globe.svg"
import TwitterLogo from "@/components/svgs/x-logo.svg"
import { HeroBody, HeroItem, HeroItemLabel } from "@/components/ui/hero"
import Link from "@/components/ui/link"

import { cn } from "@/lib/utils"

import { DEFAULT_PAGE_STATE, SITE_NAME } from "@/lib/constants"

import { getClustersByTeamId } from "@/lib/api/clusters"
import {
  fetchTeamProofsPaginated,
  fetchTeamProofsPerStatusCount,
} from "@/lib/api/proofs"
import { getTeam } from "@/lib/api/teams"
import { getMetadata } from "@/lib/metadata"
import { prettyMs } from "@/lib/time"
import { getHost, getTwitterHandle } from "@/lib/url"

export type ProverPageProps = {
  params: Promise<{ teamId: string }>
}

export async function generateMetadata({
  params,
}: ProverPageProps): Promise<Metadata> {
  const { teamId } = await params

  try {
    const team = await getTeam(teamId)
    if (!team) throw new Error()
    return getMetadata({ title: `${team.name}` })
  } catch {
    return { title: `Prover not found - ${SITE_NAME}` }
  }
}

export default async function ProverPage({ params }: ProverPageProps) {
  const { teamId } = await params

  let team: Team | undefined
  try {
    team = await getTeam(teamId)
    if (!team) throw new Error()
  } catch {
    return notFound()
  }

  const proofsPerStatusCount = await fetchTeamProofsPerStatusCount(teamId)
  const proofsPerStatusCountMap = proofsPerStatusCount.reduce(
    (acc, curr) => {
      acc[curr.proof_status] = curr.count
      return acc
    },
    {} as Record<string, number>
  )

  // prefetch proofs for first page of table
  const queryClient = new QueryClient()
  const response = await fetchTeamProofsPaginated(teamId, DEFAULT_PAGE_STATE)
  await queryClient.prefetchQuery({
    queryKey: ["proofs", teamId, DEFAULT_PAGE_STATE],
    queryFn: () => response,
  })

  const proofs = response.rows

  const clusters = await getClustersByTeamId(teamId)

  // TODO: Remove commented code if not needed:
  // const completedProofs = proofs.filter(isCompleted)
  // const totalZkVMCycles = completedProofs.reduce(
  //   (acc, proof) => acc + (proof.proving_cycles ?? 0),
  //   0
  // )
  // const totalGasProven = completedProofs.reduce(
  //   (acc, proof) => acc + (proof.block?.gas_used ?? 0),
  //   0
  // )
  // const avgZkVMCyclesPerMgas = totalZkVMCycles / (totalGasProven / 1e6)

  // const totalProvingCosts = getSumProvingCost(completedProofs)

  // const avgCostPerMgas = totalProvingCosts / (totalGasProven / 1e6)

  // const avgProofProvingTime = getProofsAvgProvingTime(proofs)

  // const performanceMetrics: Metric[] = [
  //   {
  //     key: "total-proofs",
  //     label: "Total proofs",
  //     description: <ProofStatusInfo title="total proofs" />,
  //     value: <ProofStatus statusCount={proofsPerStatusCountMap} />,
  //   },
  //   {
  //     key: "avg-zkvm-cycles-per-mgas",
  //     label: (
  //       <div>
  //         <span className="normal-case">{team.name}</span> {AVERAGE_LABEL} zk
  //         <span className="uppercase">VM</span> cycles per{" "}
  //         <span className="uppercase">M</span>gas
  //       </div>
  //     ),
  //     description:
  //       "The average number of zkVM cycles required to prove a million gas units",
  //     value:
  //       avgZkVMCyclesPerMgas > 0 ? (
  //         formatNumber(avgZkVMCyclesPerMgas)
  //       ) : (
  //         <Null />
  //       ),
  //   },
  //   {
  //     key: "avg-cost-per-mgas",
  //     label: (
  //       <div>
  //         <span className="normal-case">{team.name}</span> {AVERAGE_LABEL} cost
  //         per <span className="uppercase">M</span>gas
  //       </div>
  //     ),
  //     description: "The average cost incurred for proving a million gas units",
  //     value: avgCostPerMgas > 0 ? formatUsd(avgCostPerMgas) : <Null />,
  //   },
  //   {
  //     key: "avg-proving-time",
  //     label: `${AVERAGE_LABEL} proving time`,
  //     description:
  //       "The average amount of time taken to generate a proof using any proving instance",
  //     value:
  //       avgProofProvingTime && avgProofProvingTime > 0 ? (
  //         prettyMs(avgProofProvingTime)
  //       ) : (
  //         <Null />
  //       ),
  //   },
  // ]

  return (
    <div className="px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
      <div id="hero-section">
        <h1
          className="font-serif text-4xl font-semibold"
          style={{
            textShadow: `
              0 0 3rem hsla(var(--background-modal)),
              0 0 2rem hsla(var(--background-modal)),
              0 0 1rem hsla(var(--background-modal)),
              0 0 1rem hsla(var(--background-modal))`,
          }}
        >
          {team.logo_url && (
            <Image
              src={team.logo_url}
              alt={`${team.name} logo`}
              height={48}
              width={48}
              style={{ height: "3rem", width: "auto" }}
              className="mx-auto dark:invert"
            />
          )}
          <span className={cn(team.logo_url && "sr-only")}>{team.name}</span>
        </h1>

        <HeroBody className="mx-auto mt-0 w-fit gap-x-6 border-t border-primary px-12 py-6">
          {team.website_url && (
            <HeroItem className="hover:underline">
              <Link hideArrow className="text-body" href={team.website_url}>
                <HeroItemLabel className="gap-x-2 text-body">
                  <Globe />
                  {getHost(team.website_url)}
                </HeroItemLabel>
              </Link>
            </HeroItem>
          )}
          {team.twitter_handle && (
            <HeroItem className="hover:underline">
              <Link
                hideArrow
                className="text-body"
                href={new URL(team.twitter_handle, "https://x.com/").toString()}
              >
                <HeroItemLabel className="gap-x-2 text-body">
                  <TwitterLogo />
                  {getTwitterHandle(team.twitter_handle)}
                </HeroItemLabel>
              </Link>
            </HeroItem>
          )}
          {team.github_org && (
            <HeroItem className="hover:underline">
              <Link
                hideArrow
                className="text-body"
                href={new URL(team.github_org, "https://github.com").toString()}
              >
                <HeroItemLabel className="gap-x-2 text-body">
                  <GitHub />
                  {team.github_org}
                </HeroItemLabel>
              </Link>
            </HeroItem>
          )}
        </HeroBody>
      </div>

      <div className="mt-14 space-y-20">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="relative rounded-[1.25rem] bg-background p-6">
            <div className="absolute -inset-px z-[-2] rounded-[calc(1.25rem_+_1px)] bg-gradient-to-tl from-primary to-primary/10" />
            <div className="absolute -inset-px z-[-1] rounded-[1.25rem] bg-black/10" />
            <div className="font-mono">Multi-machine performance</div>
            <div className="flex flex-wrap justify-center gap-2 text-nowrap">
              <div className="row-span-2 grid grid-rows-subgrid gap-y-0.5 p-4">
                <div className="text-center font-mono text-sm font-bold">
                  proofs
                </div>
                <div className="text-center font-mono text-2xl font-semibold text-primary">
                  {proofs.length}
                </div>
              </div>
              <div className="row-span-2 grid grid-rows-subgrid gap-y-0.5 p-4">
                <div className="text-center font-mono text-sm font-bold">
                  avg cost
                </div>
                <div className="text-center font-mono text-2xl font-semibold text-primary">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumSignificantDigits: 2,
                  }).format(0.0069)}
                </div>
              </div>
              <div className="row-span-2 grid grid-rows-subgrid gap-y-0.5 p-4">
                <div className="text-center font-mono text-sm font-bold">
                  avg time
                </div>
                <div className="text-center font-mono text-2xl font-semibold text-primary">
                  {prettyMs(69_000)}
                </div>
              </div>
            </div>
          </div>
          <div className="relative rounded-[1.25rem] bg-background p-6">
            <div className="absolute -inset-px z-[-2] rounded-[calc(1.25rem_+_1px)] bg-gradient-to-tl from-primary to-primary/10" />
            <div className="absolute -inset-px z-[-1] rounded-[1.25rem] bg-black/10" />
            <div className="font-mono">Single machine performance</div>
            <div className="flex flex-wrap justify-center gap-2 text-nowrap">
              <div className="row-span-2 grid grid-rows-subgrid gap-y-0.5 p-4">
                <div className="text-center font-mono text-sm font-bold">
                  proofs
                </div>
                <div className="text-center font-mono text-2xl font-semibold text-primary">
                  {proofs.length}
                </div>
              </div>
              <div className="row-span-2 grid grid-rows-subgrid gap-y-0.5 p-4">
                <div className="text-center font-mono text-sm font-bold">
                  avg cost
                </div>
                <div className="text-center font-mono text-2xl font-semibold text-primary">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumSignificantDigits: 2,
                  }).format(0.0042)}
                </div>
              </div>
              <div className="row-span-2 grid grid-rows-subgrid gap-y-0.5 p-4">
                <div className="text-center font-mono text-sm font-bold">
                  avg time
                </div>
                <div className="text-center font-mono text-2xl font-semibold text-primary">
                  {prettyMs(42_000)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* // TODO: Add conditional for this aside; hide if team not developing any zkVM software */}
        <aside className="flex items-center justify-center gap-2 rounded bg-primary-dark px-6 py-4 text-center text-white">
          {team.logo_url && (
            <Image
              src={team.logo_url}
              alt={`${team.name} logo`}
              height={48}
              width={48}
              style={{ height: "1.5rem", width: "auto" }}
              className="inline-block invert"
            />
          )}
          <span className={cn(team.logo_url && "sr-only")}>{team.name}</span>
          is also the team behind the zkVM{" "}
          <Link
            href="/zkvk/TODO"
            className="text-primary-light hover:underline"
          >
            SP1
          </Link>
        </aside>

        <MachineTabs
          // TODO: Separate multi vs single machine data
          singleContent={<ClusterTable clusters={clusters} />}
          multiContent={<ClusterTable clusters={clusters} />}
        />
      </div>
    </div>
  )
}

import { type Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"

import type { Metric, Proof } from "@/lib/types"

import Null from "@/components/Null"
import ProofStatus, { ProofStatusInfo } from "@/components/ProofStatus"
import Cpu from "@/components/svgs/cpu.svg"
import GitHub from "@/components/svgs/github.svg"
import Globe from "@/components/svgs/globe.svg"
import ProofCircle from "@/components/svgs/proof-circle.svg"
import TrendingUp from "@/components/svgs/trending-up.svg"
import XLogo from "@/components/svgs/x-logo.svg"
import TeamLogo from "@/components/TeamLogo"
import TeamProofsTable from "@/components/TeamProofsTable"
import { Card } from "@/components/ui/card"
import {
  HeroBody,
  HeroDivider,
  HeroItem,
  HeroItemLabel,
  HeroSection,
  HeroTitle,
} from "@/components/ui/hero"
import * as Info from "@/components/ui/info"
import {
  MetricBox,
  MetricInfo,
  MetricLabel,
  MetricValue,
} from "@/components/ui/metric"

import { cn } from "@/lib/utils"

import { AVERAGE_LABEL, DEFAULT_PAGE_STATE, SITE_NAME } from "@/lib/constants"

import { getClustersByTeamId } from "@/lib/api/clusters"
import {
  fetchTeamProofsPaginated,
  fetchTeamProofsPerStatusCount,
} from "@/lib/api/proofs"
import { getTeam } from "@/lib/api/teams"
import { getMetadata } from "@/lib/metadata"
import { formatNumber, formatUsd } from "@/lib/number"
import {
  getProofsAvgProvingTime,
  getSumProvingCost,
  isCompleted,
} from "@/lib/proofs"
import { prettyMs } from "@/lib/time"
import { getHost, getTwitterHandle } from "@/lib/url"

type ProverPageProps = {
  params: Promise<{ teamId: string }>
}

export async function generateMetadata({
  params,
}: ProverPageProps): Promise<Metadata> {
  const { teamId } = await params

  const team = await getTeam(teamId)

  if (!team) return { title: `Prover not found - ${SITE_NAME}` }

  return getMetadata({ title: `${team.name}` })
}

export default async function ProverPage({ params }: ProverPageProps) {
  const { teamId } = await params

  const team = await getTeam(teamId)

  if (!team) return notFound()

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

  const completedProofs = proofs.filter(isCompleted)
  const totalZkVMCycles = completedProofs.reduce(
    (acc, proof) => acc + (proof.proving_cycles ?? 0),
    0
  )
  const totalGasProven = completedProofs.reduce(
    (acc, proof) => acc + (proof.block?.gas_used ?? 0),
    0
  )
  const avgZkVMCyclesPerMgas = totalZkVMCycles / (totalGasProven / 1e6)

  const totalProvingCosts = getSumProvingCost(completedProofs)

  const avgCostPerMgas = totalProvingCosts / (totalGasProven / 1e6)

  const avgProofProvingTime = getProofsAvgProvingTime(proofs)

  const performanceMetrics: Metric[] = [
    {
      key: "total-proofs",
      label: "Total proofs",
      description: <ProofStatusInfo title="total proofs" />,
      value: <ProofStatus statusCount={proofsPerStatusCountMap} />,
    },
    {
      key: "avg-zkvm-cycles-per-mgas",
      label: (
        <div>
          <span className="normal-case">{team.name}</span> {AVERAGE_LABEL} zk
          <span className="uppercase">VM</span> cycles per{" "}
          <span className="uppercase">M</span>gas
        </div>
      ),
      description:
        "The average number of zkVM cycles required to prove a million gas units",
      value:
        avgZkVMCyclesPerMgas > 0 ? (
          formatNumber(avgZkVMCyclesPerMgas)
        ) : (
          <Null />
        ),
    },
    {
      key: "avg-cost-per-mgas",
      label: (
        <div>
          <span className="normal-case">{team.name}</span> {AVERAGE_LABEL} cost
          per <span className="uppercase">M</span>gas
        </div>
      ),
      description: "The average cost incurred for proving a million gas units",
      value: avgCostPerMgas > 0 ? formatUsd(avgCostPerMgas) : <Null />,
    },
    {
      key: "avg-proving-time",
      label: `${AVERAGE_LABEL} proving time`,
      description:
        "The average amount of time taken to generate a proof using any proving instance",
      value:
        avgProofProvingTime && avgProofProvingTime > 0 ? (
          prettyMs(avgProofProvingTime)
        ) : (
          <Null />
        ),
    },
  ]

  return (
    <div className="space-y-20">
      <HeroSection>
        <HeroTitle className="h-20 items-center gap-6">
          <div className="relative h-20 w-56">
            <TeamLogo
              src={team.logo_url}
              alt={`${team.name || "Prover"} logo`}
            />
          </div>
          <h1
            className={cn(
              "font-mono text-3xl font-semibold",
              team.logo_url && "sr-only"
            )}
          >
            {team.name}
          </h1>
        </HeroTitle>

        <HeroDivider />

        <HeroBody>
          {team.website_url && (
            <HeroItem className="hover:underline">
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={team.website_url}
              >
                <HeroItemLabel className="text-body">
                  <Globe className="text-body-secondary" />
                  {getHost(team.website_url)}
                </HeroItemLabel>
              </Link>
            </HeroItem>
          )}
          {team.twitter_handle && (
            <HeroItem className="hover:underline">
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={new URL(team.twitter_handle, "https://x.com/").toString()}
              >
                <HeroItemLabel className="text-body">
                  <XLogo className="text-body-secondary" />
                  {getTwitterHandle(team.twitter_handle)}
                </HeroItemLabel>
              </Link>
            </HeroItem>
          )}
          {team.github_org && (
            <HeroItem className="hover:underline">
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={new URL(team.github_org, "https://github.com").toString()}
              >
                <HeroItemLabel className="text-body">
                  <GitHub className="text-body-secondary" />
                  {team.github_org}
                </HeroItemLabel>
              </Link>
            </HeroItem>
          )}
        </HeroBody>
      </HeroSection>

      <section>
        <h2 className="flex items-center gap-2 text-lg font-normal text-primary">
          <TrendingUp /> Prover performance
        </h2>
        <div className="flex flex-wrap gap-x-8">
          {performanceMetrics.map(({ key, label, description, value }) => (
            <MetricBox key={key}>
              <MetricLabel>
                <MetricInfo label={label}>{description}</MetricInfo>
              </MetricLabel>
              <MetricValue>{value}</MetricValue>
            </MetricBox>
          ))}
        </div>
      </section>

      <section>
        <h2 className="flex items-center gap-2 text-lg font-normal text-primary">
          <ProofCircle /> Proofs
        </h2>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <TeamProofsTable teamId={team.id} />
        </HydrationBoundary>
      </section>

      <section>
        <h2 className="flex items-center gap-2 text-lg font-normal text-primary">
          <Cpu /> Proving instances
        </h2>
        <div className="mt-8 grid gap-8 md:grid-cols-[repeat(auto-fill,minmax(24rem,1fr))]">
          {clusters.map(({ nickname, hardware, description }) => (
            <Card key={nickname} className="space-y-4">
              <h3 className="text-xl font-semibold">{nickname}</h3>
              {hardware && (
                <p className="font-mono text-body">Hardware: {hardware}</p>
              )}
              {description && (
                <Info.Description>{description}</Info.Description>
              )}
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

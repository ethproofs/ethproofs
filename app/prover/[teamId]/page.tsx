import { type Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import prettyMilliseconds from "pretty-ms"

import type { Metric, Proof, ProofExtended, ProverCluster } from "@/lib/types"

import Null from "@/components/Null"
import ProofStatus, { ProofStatusInfo } from "@/components/ProofStatus"
import Cpu from "@/components/svgs/cpu.svg"
import GitHub from "@/components/svgs/github.svg"
import Globe from "@/components/svgs/globe.svg"
import ProofCircle from "@/components/svgs/proof-circle.svg"
import TrendingUp from "@/components/svgs/trending-up.svg"
import XLogo from "@/components/svgs/x-logo.svg"
import TeamLogo from "@/components/TeamLogo"
import { Card } from "@/components/ui/card"
import DataTable from "@/components/ui/data-table"
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

import { SITE_NAME } from "@/lib/constants"

import { columns } from "./columns"

import { getMetadata } from "@/lib/metadata"
import { formatNumber } from "@/lib/number"
import { getProofsAvgLatency, isCompleted } from "@/lib/proofs"
import { getHost, getTwitterHandle } from "@/lib/url"
import { createClient } from "@/utils/supabase/client"

type ProverPageProps = {
  params: Promise<{ teamId: number }>
}

export async function generateMetadata({
  params,
}: ProverPageProps): Promise<Metadata> {
  const { teamId } = await params

  const supabase = createClient()

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("*")
    .eq("team_id", teamId)
    .single()

  if (teamError || !team) return { title: `Prover not found - ${SITE_NAME}` }

  return getMetadata({ title: `${team.team_name}` })
}

export default async function ProverPage({ params }: ProverPageProps) {
  const { teamId } = await params

  const supabase = createClient()

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("*")
    .eq("team_id", teamId)
    .single()

  if (!team || !team.user_id || teamError) return notFound()

  const { data: proofsExtended, error: proofError } = await supabase
    .from("proofs")
    .select("*, cluster:clusters(*), block:blocks(gas_used,timestamp)")
    .eq("user_id", team.user_id)

  if (!team || teamError || !proofsExtended?.length || proofError)
    return notFound()

  const provingMachines = Object.values(
    proofsExtended.reduce((acc, curr) => {
      if (!curr.cluster || !curr.cluster.cluster_id) return acc
      return {
        ...acc,
        [curr.cluster.cluster_id]: curr.cluster,
      }
    }, {})
  ) satisfies ProverCluster[]

  const completedProofs = proofsExtended.filter(
    (p) => p.proof_status === "proved"
  )
  const totalZkVMCycles = completedProofs.reduce(
    (acc, proof) => acc + (proof.proving_cycles ?? 0),
    0
  )
  const totalGasProven = completedProofs.reduce(
    (acc, proof) => acc + (proof.block?.gas_used ?? 0),
    0
  )
  const avgZkVMCyclesPerMgas = totalZkVMCycles / totalGasProven / 1e6
  const proverTotalFees = completedProofs.reduce(
    (acc, proof) => acc + (proof.proving_cost ?? 0),
    0
  )
  const avgCostPerMgas = proverTotalFees / totalGasProven / 1e6

  const avgProofLatency = getProofsAvgLatency(proofsExtended)

  const performanceMetrics: Metric[] = [
    {
      label: "Total proofs",
      description: <ProofStatusInfo title="total proofs" />,
      value: <ProofStatus proofs={proofsExtended} />,
    },
    {
      label: (
        <>
          <span className="normal-case">{team.team_name}</span> Avg zk
          <span className="uppercase">VM</span> cycles per{" "}
          <span className="uppercase">M</span>gas
        </>
      ),
      description:
        "The average number of zkVM cycles required to prove a million gas units",
      value: formatNumber(avgZkVMCyclesPerMgas),
    },
    {
      label: (
        <>
          <span className="normal-case">{team.team_name}</span> Avg cost per{" "}
          <span className="uppercase">M</span>gas
        </>
      ),
      description: "The average cost incurred for proving a million gas units",
      value: formatNumber(avgCostPerMgas, {
        style: "currency",
        currency: "USD",
      }),
    },
    {
      label: "Avg proving time",
      description:
        "The average amount of time taken to generate a proof using any proving instance",
      value: avgProofLatency ? prettyMilliseconds(avgProofLatency) : <Null />,
    },
  ]

  return (
    <div className="space-y-20">
      <HeroSection>
        <HeroTitle className="h-20 items-center gap-6">
          <div className="relative h-20 w-56">
            <TeamLogo
              src={team.logo_url}
              alt={`${team.team_name || "Prover"} logo`}
            />
          </div>
          <h1
            className={cn(
              "font-mono text-3xl font-semibold",
              team.logo_url && "sr-only"
            )}
          >
            {team.team_name}
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
          {performanceMetrics.map(({ label, description, value }, idx) => (
            <MetricBox key={idx}>
              <MetricLabel>
                {label}
                <MetricInfo>{description}</MetricInfo>
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
        <DataTable
          columns={columns}
          data={proofsExtended as ProofExtended[]}
          sorting={[{ id: "block_number", desc: true }]}
        />
      </section>

      <section>
        <h2 className="flex items-center gap-2 text-lg font-normal text-primary">
          <Cpu /> Proving instances
        </h2>
        <div
          className="mt-8 grid gap-8"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(24rem, 1fr))",
          }}
        >
          {provingMachines.map(
            ({ cluster_name, cluster_hardware, cluster_description }) => (
              <Card key={cluster_name} className="space-y-4">
                <h3 className="text-xl font-semibold">{cluster_name}</h3>
                {cluster_hardware && (
                  <p className="font-mono text-body">
                    Hardware: {cluster_hardware}
                  </p>
                )}
                {cluster_description && (
                  <Info.Description>{cluster_description}</Info.Description>
                )}
              </Card>
            )
          )}
        </div>
      </section>
    </div>
  )
}

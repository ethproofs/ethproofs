import { type Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"

import type { Team, Zkvm } from "@/lib/types"

import ClusterTable from "@/components/ClusterTable"
import MachineTabs from "@/components/MachineTabs"
import GitHub from "@/components/svgs/github.svg"
import Globe from "@/components/svgs/globe.svg"
import TwitterLogo from "@/components/svgs/x-logo.svg"
import { HeroBody, HeroItem, HeroItemLabel } from "@/components/ui/hero"
import Link from "@/components/ui/link"
import VendorsAside from "@/components/VendorsAside"

import { cn } from "@/lib/utils"

import { SITE_NAME } from "@/lib/constants"

import { getActiveClusters } from "@/lib/api/clusters"
import { getTeamSummary } from "@/lib/api/stats"
import { getVendorByUserId } from "@/lib/api/vendor"
import { getZkvmsByVendorId } from "@/lib/api/zkvms"
import { getMetadata } from "@/lib/metadata"
import { formatUsd } from "@/lib/number"
import { getTeamByIdOrSlug } from "@/lib/teams"
import { prettyMs } from "@/lib/time"
import { getHost, getTwitterHandle } from "@/lib/url"

export type TeamDetailsPageProps = {
  params: Promise<{ teamId: string }>
}

export async function generateMetadata({
  params,
}: TeamDetailsPageProps): Promise<Metadata> {
  const { teamId } = await params

  try {
    const team = await getTeamByIdOrSlug(teamId)
    if (!team) throw new Error()
    return getMetadata({ title: `${team.name}` })
  } catch {
    return { title: `Proving team not found - ${SITE_NAME}` }
  }
}

export default async function TeamDetailsPage({
  params,
}: TeamDetailsPageProps) {
  const { teamId } = await params

  let team: Team | undefined
  try {
    team = await getTeamByIdOrSlug(teamId)
    if (!team) throw new Error()
  } catch {
    return notFound()
  }

  const [teamSummary, vendor, clusters] = await Promise.all([
    getTeamSummary(team.id),
    getVendorByUserId(team.id),
    getActiveClusters({ teamId: team.id }),
  ])

  const isVendor = !!vendor

  let zkvms: Zkvm[] | undefined
  if (isVendor) {
    zkvms = await getZkvmsByVendorId(vendor.id)
  }

  const singleMachineClusters = clusters.filter(
    (cluster) => !cluster.is_multi_machine
  )

  const multiMachineClusters = clusters.filter(
    (cluster) => cluster.is_multi_machine
  )

  return (
    <div className="mt-24 px-6 md:px-8">
      <div id="hero-section">
        <h1 className="text-shadow font-serif text-4xl font-semibold">
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

        <HeroBody className="mx-auto mt-0 flex w-fit flex-wrap justify-center gap-x-6 border-t border-primary px-12 py-6">
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

      <div className="mx-auto mt-14 max-w-screen-xl space-y-20 [&>section]:w-full">
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                  {teamSummary.total_proofs_multi}
                </div>
              </div>
              <div className="row-span-2 grid grid-rows-subgrid gap-y-0.5 p-4">
                <div className="text-center font-mono text-sm font-bold">
                  avg cost
                </div>
                <div className="text-center font-mono text-2xl font-semibold text-primary">
                  {formatUsd(teamSummary.avg_cost_per_proof_multi ?? 0)}
                </div>
              </div>
              <div className="row-span-2 grid grid-rows-subgrid gap-y-0.5 p-4">
                <div className="text-center font-mono text-sm font-bold">
                  avg time
                </div>
                <div className="text-center font-mono text-2xl font-semibold text-primary">
                  {prettyMs(Number(teamSummary.avg_proving_time_multi ?? 0))}
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
                  {teamSummary.total_proofs_single}
                </div>
              </div>
              <div className="row-span-2 grid grid-rows-subgrid gap-y-0.5 p-4">
                <div className="text-center font-mono text-sm font-bold">
                  avg cost
                </div>
                <div className="text-center font-mono text-2xl font-semibold text-primary">
                  {formatUsd(teamSummary.avg_cost_per_proof_single ?? 0)}
                </div>
              </div>
              <div className="row-span-2 grid grid-rows-subgrid gap-y-0.5 p-4">
                <div className="text-center font-mono text-sm font-bold">
                  avg time
                </div>
                <div className="text-center font-mono text-2xl font-semibold text-primary">
                  {prettyMs(Number(teamSummary.avg_proving_time_single ?? 0))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {isVendor && zkvms && <VendorsAside team={team} zkvms={zkvms} />}

        <MachineTabs
          singleContent={<ClusterTable clusters={singleMachineClusters} />}
          multiContent={<ClusterTable clusters={multiMachineClusters} />}
        />
      </div>
    </div>
  )
}

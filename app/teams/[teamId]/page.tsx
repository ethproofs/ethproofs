import { type Metadata } from "next"
import { notFound } from "next/navigation"

import type { SummaryItem, Team, Zkvm } from "@/lib/types"

import ClusterTable from "@/components/ClusterTable"
import { DisplayTeam } from "@/components/DisplayTeamLink"
import KPIs from "@/components/KPIs"
import MachineTabs from "@/components/MachineTabs"
import Null from "@/components/Null"
import GitHub from "@/components/svgs/github.svg"
import Globe from "@/components/svgs/globe.svg"
import TwitterLogo from "@/components/svgs/x-logo.svg"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { HeroBody, HeroItem, HeroItemLabel } from "@/components/ui/hero"
import Link from "@/components/ui/link"
import VendorsAside from "@/components/VendorsAside"

import { SITE_NAME } from "@/lib/constants"

import { getActiveClusters } from "@/lib/api/clusters"
import { getTeamSummary } from "@/lib/api/stats"
import { getVendor } from "@/lib/api/vendors"
import { getZkvmsByVendorId } from "@/lib/api/zkvms"
import { getMetadata } from "@/lib/metadata"
import { formatUsd } from "@/lib/number"
import { getTeamByIdOrSlug, getVendorByIdOrSlug } from "@/lib/teams"
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
    if (!team) {
      // if team is not found, try to get vendor
      // NOTE: edge case for handling only vendor pages
      const vendor = await getVendorByIdOrSlug(teamId)
      // Convert to Team interface: vendor does not have `storage_quota_bytes`
      if (vendor) team = { ...vendor, storage_quota_bytes: null }
    }

    if (!team) {
      throw new Error()
    }
  } catch {
    return notFound()
  }

  const [teamSummary, vendor, clusters] = await Promise.all([
    getTeamSummary(team.id),
    getVendor(team.id),
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

  const singleMachineSummary: SummaryItem[] = [
    {
      key: "total-proofs",
      label: "proofs",
      value: teamSummary?.total_proofs_single || <Null />,
    },
    {
      key: "avg-cost",
      label: "avg cost",
      value: teamSummary?.avg_cost_per_proof_single ? (
        formatUsd(teamSummary.avg_cost_per_proof_single)
      ) : (
        <Null />
      ),
    },
    {
      key: "avg-time",
      label: "avg time",
      value:
        Number(teamSummary?.avg_proving_time_single) > 0 ? (
          prettyMs(Number(teamSummary?.avg_proving_time_single))
        ) : (
          <Null />
        ),
    },
  ]

  const multiMachineSummary: SummaryItem[] = [
    {
      key: "total-proofs",
      label: "proofs",
      value: teamSummary?.total_proofs_multi || <Null />,
    },
    {
      key: "avg-cost",
      label: "avg cost",
      value: teamSummary?.avg_cost_per_proof_multi ? (
        formatUsd(teamSummary?.avg_cost_per_proof_multi)
      ) : (
        <Null />
      ),
    },
    {
      key: "avg-time",
      label: "avg time",
      value:
        Number(teamSummary?.avg_proving_time_multi) > 0 ? (
          prettyMs(Number(teamSummary?.avg_proving_time_multi))
        ) : (
          <Null />
        ),
    },
  ]

  return (
    <div className="px-6 md:px-8">
      <div id="hero-section" className="mb-24 mt-16 md:mt-24">
        <h1 className="text-shadow flex justify-center text-center font-serif text-4xl font-semibold">
          <DisplayTeam team={team} height={48} />
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

      <div className="mx-auto max-w-screen-xl space-y-20 [&>section]:w-full">
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="!space-y-0">
            <CardHeader className="font-mono">
              Multi-machine performance
            </CardHeader>
            <CardContent>
              <KPIs items={multiMachineSummary} layout="flipped" />
            </CardContent>
          </Card>
          <Card className="!space-y-0">
            <CardHeader className="font-mono">
              Single machine performance
            </CardHeader>
            <CardContent>
              <KPIs items={singleMachineSummary} layout="flipped" />
            </CardContent>
          </Card>
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

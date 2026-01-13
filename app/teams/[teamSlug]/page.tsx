import { Globe } from "lucide-react"
import { type Metadata } from "next"
import { notFound } from "next/navigation"

import type { SummaryItem, Team, Zkvm } from "@/lib/types"

import { BasicTabs } from "@/components/BasicTabs"
import { ClustersTable } from "@/components/clusters-table/clusters-table"
import KPIs from "@/components/KPIs"
import { Null } from "@/components/Null"
import GitHubLogo from "@/components/svgs/github-logo.svg"
import XLogo from "@/components/svgs/x-logo.svg"
import { TeamLogoLink } from "@/components/team-logo-link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Item, ItemContent, ItemMedia } from "@/components/ui/item"
import Link from "@/components/ui/link"
import ZkvmProvidersAside from "@/components/ZkvmProvidersAside"

import { getActiveClusters } from "@/lib/api/clusters"
import { getClusterSummary, getTeamSummary } from "@/lib/api/stats"
import { getTeamBySlug } from "@/lib/api/teams"
import { getZkvmsByTeamId } from "@/lib/api/zkvms"
import { isMultiGpuCluster } from "@/lib/cluster"
import { getMetadata } from "@/lib/metadata"
import { formatUsd } from "@/lib/number"
import { prettyMs } from "@/lib/time"
import { getHost, getTwitterHandle } from "@/lib/url"

export type TeamDetailsPageProps = {
  params: Promise<{ teamSlug: string }>
}

export async function generateMetadata({
  params,
}: TeamDetailsPageProps): Promise<Metadata> {
  const { teamSlug } = await params

  try {
    const team = await getTeamBySlug(teamSlug)
    if (!team) throw new Error()
    return getMetadata({ title: `${team.name}` })
  } catch {
    return { title: `Proving team not found` }
  }
}

export default async function TeamDetailsPage({
  params,
}: TeamDetailsPageProps) {
  const { teamSlug } = await params

  let team: Team | undefined
  try {
    team = await getTeamBySlug(teamSlug)
    if (!team) {
      throw new Error()
    }
  } catch {
    return notFound()
  }

  const [clusterSummary, teamSummary, activeClusters] = await Promise.all([
    getClusterSummary(),
    getTeamSummary(team.id),
    getActiveClusters({ teamId: team.id }),
  ])

  const zkvms: Zkvm[] = (await getZkvmsByTeamId(team.id)) ?? []

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

  const singleMachineClusters = clusters.filter(
    (cluster) => !isMultiGpuCluster(cluster)
  )

  const multiMachineClusters = clusters.filter((cluster) =>
    isMultiGpuCluster(cluster)
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
      <div id="hero-section" className="my-12">
        <h1 className="flex justify-center pb-6 text-center font-serif text-4xl font-semibold">
          <TeamLogoLink team={team} height={48} />
        </h1>

        <div className="mx-auto mt-0 flex w-fit flex-wrap justify-center gap-x-6 border-t border-primary px-12 py-6">
          {team.website_url && (
            <Item asChild size="sm" className="p-0">
              <Link hideArrow href={team.website_url}>
                <ItemMedia>
                  <Globe className="size-4" />
                </ItemMedia>
                <ItemContent className="hover:underline">
                  {getHost(team.website_url)}
                </ItemContent>
              </Link>
            </Item>
          )}
          {team.twitter_handle && (
            <Item asChild size="sm" className="p-0">
              <Link
                hideArrow
                href={new URL(team.twitter_handle, "https://x.com/").toString()}
              >
                <ItemMedia>
                  <XLogo className="h-3 w-auto" />
                </ItemMedia>
                <ItemContent className="hover:underline">
                  {getTwitterHandle(team.twitter_handle)}
                </ItemContent>
              </Link>
            </Item>
          )}
          {team.github_org && (
            <Item asChild size="sm" className="p-0">
              <Link
                hideArrow
                href={new URL(team.github_org, "https://github.com").toString()}
              >
                <ItemMedia>
                  <GitHubLogo className="size-4" />
                </ItemMedia>
                <ItemContent className="hover:underline">
                  {team.github_org}
                </ItemContent>
              </Link>
            </Item>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-screen-xl space-y-12 [&>section]:w-full">
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="!space-y-0">
            <CardHeader className="">multi-GPU performance</CardHeader>
            <CardContent>
              <KPIs items={multiMachineSummary} layout="flipped" />
            </CardContent>
          </Card>
          <Card className="!space-y-0">
            <CardHeader className="">single-GPU performance</CardHeader>
            <CardContent>
              <KPIs items={singleMachineSummary} layout="flipped" />
            </CardContent>
          </Card>
        </section>

        {zkvms.length > 0 && <ZkvmProvidersAside team={team} zkvms={zkvms} />}

        <BasicTabs
          className="px-0"
          title="active clusters"
          defaultTab={multiMachineClusters.length === 0 ? "right" : "left"}
          contentLeft={
            <ClustersTable className="mt-4" clusters={multiMachineClusters} />
          }
          contentRight={
            <ClustersTable className="mt-4" clusters={singleMachineClusters} />
          }
        />
      </div>
    </div>
  )
}

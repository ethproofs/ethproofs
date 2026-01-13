"use client"

import { Globe } from "lucide-react"

import type { ClusterSummary, ZkvmMetrics } from "@/lib/types"

import GitHubLogo from "@/components/svgs/github-logo.svg"
import XLogo from "@/components/svgs/x-logo.svg"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import Link from "@/components/ui/link"
import {
  ZkvmPieChart,
  ZkvmPieChartLegend,
} from "@/components/zkvms-table/zkvm-pie-chart"
import { getSlicesFromMetrics } from "@/components/zkvms-table/zkvm-slices"

import { TeamLogoLink } from "../team-logo-link"

import { ZkvmRow } from "./zkvms-table"

import { getHost, getTwitterHandle } from "@/lib/url"

interface ZkvmDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  zkvm: ZkvmRow | null
  metrics?: Partial<ZkvmMetrics>
  clusters: ClusterSummary[]
}

export function ZkvmDrawer({
  open,
  onOpenChange,
  zkvm,
  metrics,
  clusters,
}: ZkvmDrawerProps) {
  if (!zkvm) return null

  const latestVersion = zkvm.versions.reduce((latest, version) =>
    version.id > latest.id ? version : latest
  )

  const slices = getSlicesFromMetrics(metrics)

  const team = zkvm.team

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-full w-[420px] overflow-y-auto border-l">
        <DrawerHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-xl">{zkvm.name}</DrawerTitle>
            <TeamLogoLink team={team} height={18} />
          </div>
        </DrawerHeader>
        <div className="border-b py-4">
          <div className="flex flex-wrap justify-center gap-x-4 text-sm">
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
                  href={new URL(
                    team.twitter_handle,
                    "https://x.com/"
                  ).toString()}
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
                  href={new URL(
                    team.github_org,
                    "https://github.com"
                  ).toString()}
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

        <div className="flex flex-col p-4">
          <div className="grid grid-cols-4 gap-4 text-center text-sm">
            <div>
              <div className="text-body-secondary">version</div>
              <div className="font-medium">{latestVersion.version}</div>
            </div>
            <div>
              <div className="text-body-secondary">ISA</div>
              <div className="font-medium">{zkvm.isa}</div>
            </div>
            <div>
              <div className="text-body-secondary">open source</div>
              <div className="font-medium">
                {zkvm.is_open_source ? "yes" : "no"}
              </div>
            </div>
            <div>
              <div className="text-body-secondary">license</div>
              <div className="font-medium">
                {zkvm.dual_licenses ? "dual" : "single"}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 border-b pb-4">
          <ZkvmPieChart slices={slices} className="aspect-square h-48" />
          <ZkvmPieChartLegend slices={slices} />
        </div>

        <div className="flex flex-col p-4">
          <h3 className="mb-3 text-base font-medium">active clusters</h3>
          {clusters.length === 0 ? (
            <div className="text-base text-body-secondary">
              no active clusters
            </div>
          ) : (
            <ItemGroup className="gap-2">
              {clusters.map((cluster) => (
                <Item
                  key={cluster.id}
                  asChild
                  variant="outline"
                  size="sm"
                  className="hover:bg-muted"
                >
                  <Link href={`/clusters/${cluster.id}`} hideArrow>
                    <ItemContent>
                      <ItemTitle>{cluster.name}</ItemTitle>
                    </ItemContent>
                    <ItemContent className="text-xs text-body-secondary">
                      {cluster.team.name}
                    </ItemContent>
                  </Link>
                </Item>
              ))}
            </ItemGroup>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

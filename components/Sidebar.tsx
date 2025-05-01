import { Suspense } from "react"

import Bomb from "@/components/svgs/bomb.svg"
import Box from "@/components/svgs/box.svg"
import Bug from "@/components/svgs/bug.svg"
import Document from "@/components/svgs/document.svg"
import EthProofsLogo from "@/components/svgs/eth-proofs-logo.svg"
import GitHub from "@/components/svgs/github.svg"
import Heart from "@/components/svgs/heart.svg"
import HexTarget from "@/components/svgs/hex-target.svg"
import LightningBolt from "@/components/svgs/lightning-bolt.svg"
import ProofCheck from "@/components/svgs/proof-check.svg"
import TrendUpChart from "@/components/svgs/trend-up-chart.svg"

import { SITE_REPO } from "@/lib/constants"

import SearchInput from "./header/SearchInput"
import ThemeSwitch from "./header/ThemeSwitch"
import Link from "./ui/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "./ui/sidebar"
import { Skeleton } from "./ui/skeleton"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="mb-4 mt-11 space-y-10 px-6">
        <div className="flex items-end justify-between gap-4">
          <Link href="/">
            <EthProofsLogo className="text-[2.625rem] text-body" />
          </Link>

          <Suspense fallback={<Skeleton className="h-8 w-12 rounded-full" />}>
            <ThemeSwitch />
          </Suspense>
        </div>
        <SearchInput className="max-md:hidden" placeholder="Search by block" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="gap-y-10 p-6">
          <SidebarGroup className="">
            <SidebarGroupLabel className="">Home</SidebarGroupLabel>
            <SidebarMenuItem>
              <Link
                href="/"
                className="inline-flex text-body hover:text-primary [&>svg:first-child]:me-2 [&>svg:first-child]:size-6"
              >
                <TrendUpChart />
                dashboard
              </Link>
            </SidebarMenuItem>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Explore</SidebarGroupLabel>
            <SidebarMenuItem>
              <Link
                href="/zkvms"
                className="inline-flex text-body hover:text-primary [&>svg:first-child]:me-2 [&>svg:first-child]:size-6"
              >
                <LightningBolt />
                zkVMs
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link
                href="/provers"
                className="inline-flex text-body hover:text-primary [&>svg:first-child]:me-2 [&>svg:first-child]:size-6"
              >
                <ProofCheck />
                provers
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link
                href="/blocks"
                className="inline-flex text-body hover:text-primary [&>svg:first-child]:me-2 [&>svg:first-child]:size-6"
              >
                <Box strokeWidth="1" />
                blocks
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link
                href="/killers"
                className="inline-flex text-body hover:text-primary [&>svg:first-child]:me-2 [&>svg:first-child]:size-6"
              >
                <Bomb />
                killers
              </Link>
            </SidebarMenuItem>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Learn</SidebarGroupLabel>
            <SidebarMenuItem>
              <Link
                href="/learn"
                className="inline-flex text-body hover:text-primary [&>svg:first-child]:me-2 [&>svg:first-child]:size-6"
              >
                <Document />
                learn
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link
                href="/api.html"
                className="inline-flex text-body hover:text-primary [&>svg:first-child]:me-2 [&>svg:first-child]:size-6"
              >
                <HexTarget />
                API
              </Link>
            </SidebarMenuItem>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Contribute</SidebarGroupLabel>
            <SidebarMenuItem>
              <Link
                href={new URL(SITE_REPO, "https://github.com").toString()}
                className="inline-flex text-body hover:text-primary [&>svg:first-child]:me-2 [&>svg:first-child]:size-6"
                hideArrow
              >
                <GitHub className="p-1" />
                build Ethproofs
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link
                href={new URL(
                  SITE_REPO + "/issues/new/choose/",
                  "https://github.com"
                ).toString()}
                className="inline-flex text-body hover:text-primary [&>svg:first-child]:me-2 [&>svg:first-child]:size-6"
                hideArrow
              >
                <Bug />
                spot a bug?
              </Link>
            </SidebarMenuItem>
          </SidebarGroup>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="mx-auto mb-4 mt-8 flex max-w-prose flex-col items-center space-y-4">
        <p className="mb-4 text-center">
          Built with{" "}
          <Heart className="mb-0.5 inline animate-heart-beat text-xl text-primary" />{" "}
          by the{" "}
          <Link
            href="https://ethereum.org"
            hideArrow
            className="hover:text-primary-light"
          >
            ethereum.org
          </Link>{" "}
          team
        </p>
        <p className="text-center text-lg text-primary">
          Public goods are good
        </p>
      </SidebarFooter>
    </Sidebar>
  )
}

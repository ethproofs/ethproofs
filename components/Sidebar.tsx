import { Suspense } from "react"

import Bomb from "@/components/svgs/bomb.svg"
import Box from "@/components/svgs/box.svg"
import Document from "@/components/svgs/document.svg"
import EthProofsLogo from "@/components/svgs/eth-proofs-logo.svg"
import Heart from "@/components/svgs/heart.svg"
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
      <SidebarHeader className="my-11 space-y-10 px-6">
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
        <SidebarMenu className="gap-y-10 px-6">
          <SidebarGroup className="">
            <SidebarGroupLabel className="">Home</SidebarGroupLabel>
            <SidebarMenuItem>
              <Link
                href="/"
                className="inline-flex text-body hover:text-primary [&>svg]:me-2"
              >
                <TrendUpChart className="size-6" />
                Dashboard
              </Link>
            </SidebarMenuItem>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Explore</SidebarGroupLabel>
            <SidebarMenuItem>
              <Link
                href="/zkvms"
                className="inline-flex text-body hover:text-primary [&>svg]:me-2"
              >
                <LightningBolt className="size-6" />
                zkVMs
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link
                href="/provers"
                className="inline-flex text-body hover:text-primary [&>svg]:me-2"
              >
                <ProofCheck className="size-6" />
                provers
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link
                href="/blocks"
                className="inline-flex text-body hover:text-primary [&>svg]:me-2"
              >
                <Box className="size-6" strokeWidth="1" />
                blocks
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link
                href="/killers"
                className="inline-flex text-body hover:text-primary [&>svg]:me-2"
              >
                <Bomb className="size-6" />
                killers
              </Link>
            </SidebarMenuItem>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Learn</SidebarGroupLabel>
            <SidebarMenuItem>
              <Link
                href="/learn"
                className="inline-flex text-body hover:text-primary [&>svg]:me-2"
              >
                <Document className="size-6" />
                zkVMs and SNARKs
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link
                href="/#TODO?"
                className="inline-flex text-body hover:text-primary [&>svg]:me-2"
              >
                <Document className="size-6" />
                about
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link
                // TODO: Remove /en/ when https://github.com/ethereum/ethereum-org-website/issues/15337 is fixed
                href="https://ethereum.org/en/developers/docs/blocks"
                className="inline-flex text-body hover:text-primary [&>.external-arrow]:m-0 [&>.external-arrow]:my-auto [&>.external-arrow]:ms-1 [&>svg]:me-2"
              >
                <Document className="size-6 self-center" />
                blocks
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link
                href="/api.html"
                className="inline-flex text-body hover:text-primary [&>svg]:me-2"
              >
                <Document className="size-6" />
                API
              </Link>
            </SidebarMenuItem>
          </SidebarGroup>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="mx-auto mt-16 flex max-w-prose flex-col items-center space-y-4">
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

        <Link
          href={new URL(
            SITE_REPO + "/issues/new/choose/",
            "https://github.com"
          ).toString()}
          className="text-center font-body text-body-secondary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Spot a bug? Report it here
        </Link>
      </SidebarFooter>
    </Sidebar>
  )
}

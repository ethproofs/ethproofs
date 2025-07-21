import { Suspense } from "react"
import { Box } from "lucide-react"

import Bomb from "@/components/svgs/bomb.svg"
import Bug from "@/components/svgs/bug.svg"
import CPU from "@/components/svgs/cpu.svg"
import Document from "@/components/svgs/document.svg"
import EthProofsLogo from "@/components/svgs/eth-proofs-logo.svg"
import GitHub from "@/components/svgs/github.svg"
import Heart from "@/components/svgs/heart.svg"
import HexTarget from "@/components/svgs/hex-target.svg"
import LightningBolt from "@/components/svgs/lightning-bolt.svg"
import Team from "@/components/svgs/team.svg"
import TrendUpChart from "@/components/svgs/trend-up-chart.svg"
import Twitter from "@/components/svgs/twitter.svg"
import Link from "@/components/ui/link"

import { URL_GITHUB_REPO, URL_TWITTER } from "@/lib/constants"
import { SITE_REPO } from "@/lib/constants"

import SearchInput from "./header/SearchInput"
import ThemeSwitch from "./header/ThemeSwitch"
import { DrawerClose } from "./ui/drawer"
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "./ui/sidebar"
import { Skeleton } from "./ui/skeleton"

type AppNavigationMenuProps = {
  insideDrawer?: boolean
}

const AppNavigationMenu = ({ insideDrawer }: AppNavigationMenuProps) => {
  const MenuItem = (props: { children: React.ReactNode }) =>
    insideDrawer ? (
      <SidebarMenuItem>
        <DrawerClose asChild {...props} />
      </SidebarMenuItem>
    ) : (
      <SidebarMenuItem {...props} />
    )

  const verticalFade = {
    mask: `linear-gradient(to bottom, transparent 0rem, white 2rem, white calc(100% - 2rem), transparent 100%)`,
  }
  return (
    <>
      <SidebarHeader className="mt-11 space-y-10">
        <div className="flex items-end justify-between gap-4">
          <Link href="/">
            <EthProofsLogo className="text-[2.625rem] text-body" />
          </Link>

          <Suspense fallback={<Skeleton className="h-8 w-12 rounded-full" />}>
            <ThemeSwitch />
          </Suspense>
        </div>
        <SearchInput
          placeholder="Search by block"
          insideDrawer={insideDrawer}
        />
      </SidebarHeader>

      <SidebarContent style={verticalFade}>
        <SidebarMenu
          style={verticalFade}
          className="gap-y-2 bg-background-accent/35 px-6 py-10"
        >
          <SidebarGroup>
            <SidebarGroupLabel>Home</SidebarGroupLabel>
            <MenuItem>
              <Link
                href="/"
                className="inline-flex text-body hover:text-primary [&>svg:first-child]:me-2 [&>svg:first-child]:size-6"
              >
                <TrendUpChart />
                dashboard
              </Link>
            </MenuItem>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Explore</SidebarGroupLabel>
            <MenuItem>
              <Link
                href="/zkvms"
                className="inline-flex text-body hover:text-primary [&>svg:first-child]:me-2 [&>svg:first-child]:size-6"
              >
                <LightningBolt />
                zkVMs
              </Link>
            </MenuItem>
            <MenuItem>
              <Link
                href="/provers"
                className="inline-flex text-body hover:text-primary [&>svg:first-child]:me-2 [&>svg:first-child]:size-6"
              >
                <CPU />
                provers
              </Link>
            </MenuItem>
            <MenuItem>
              <Link
                href="/blocks"
                className="inline-flex text-body hover:text-primary [&>svg:first-child]:me-2 [&>svg:first-child]:size-6"
              >
                <Box strokeWidth="1" />
                blocks
              </Link>
            </MenuItem>
            <MenuItem>
              <Link
                href="/killers"
                className="inline-flex text-body hover:text-primary [&>svg:first-child]:me-2 [&>svg:first-child]:size-6"
              >
                <Bomb />
                killers
              </Link>
            </MenuItem>
            <MenuItem>
              <Link
                href="/teams"
                className="inline-flex text-body hover:text-primary [&>svg:first-child]:me-2 [&>svg:first-child]:size-6"
              >
                <Team />
                teams
              </Link>
            </MenuItem>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Learn</SidebarGroupLabel>
            <MenuItem>
              <Link
                href="/learn"
                className="inline-flex text-body hover:text-primary [&>svg:first-child]:me-2 [&>svg:first-child]:size-6"
              >
                <Document />
                learn
              </Link>
            </MenuItem>
            <MenuItem>
              <Link
                href="/api.html"
                className="inline-flex text-body hover:text-primary [&>svg:first-child]:me-2 [&>svg:first-child]:size-6"
              >
                <HexTarget />
                API
              </Link>
            </MenuItem>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Contribute</SidebarGroupLabel>
            <MenuItem>
              <Link
                href={URL_GITHUB_REPO}
                className="inline-flex text-body hover:text-primary [&>svg:first-child]:me-2 [&>svg:first-child]:size-6"
                hideArrow
              >
                <GitHub className="p-1" />
                build Ethproofs
              </Link>
            </MenuItem>
            <MenuItem>
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
            </MenuItem>
          </SidebarGroup>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-x-6 pb-2 font-sans font-bold [&>a]:text-2xl [&>a]:text-body">
          <Link href={URL_GITHUB_REPO} hideArrow>
            <GitHub />
          </Link>
          <Link href={URL_TWITTER} hideArrow>
            <Twitter />
          </Link>
        </div>

        <div>
          Built with{" "}
          <Heart className="mb-0.5 inline text-xl text-primary motion-safe:animate-heart-beat" />{" "}
          by the
          <br />
          <Link
            href="https://ethereum.org"
            hideArrow
            className="text-sm hover:text-primary-light"
          >
            ethereum.org
          </Link>{" "}
          team
        </div>
        <div className="text-primary">Public goods are good</div>
      </SidebarFooter>
    </>
  )
}

AppNavigationMenu.displayName = "AppNavigationMenu"

export default AppNavigationMenu

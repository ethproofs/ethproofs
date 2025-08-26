import { Suspense } from "react"
import {
  Bomb,
  Box,
  Bug,
  Cpu,
  Heart,
  HeartPulse,
  Library,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react"

import EthproofsIcon from "@/components/svgs/ethproofs-icon.svg"
import GitHub from "@/components/svgs/github.svg"
import Twitter from "@/components/svgs/twitter.svg"
import Link from "@/components/ui/link"

import { URL_GITHUB_REPO, URL_TWITTER } from "@/lib/constants"
import { SITE_REPO } from "@/lib/constants"

import SearchInput from "./header/SearchInput"
import ThemeSwitch from "./header/ThemeSwitch"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "./ui/sidebar"
import { Skeleton } from "./ui/skeleton"

const AppNavigationMenu = () => {
  const verticalFade = {
    mask: `linear-gradient(to bottom, transparent 0rem, white 2rem, white calc(100% - 2rem), transparent 100%)`,
  }

  const customSidebarMenuItemLinkClass =
    "inline-flex items-center text-body hover:text-primary [&>svg:first-child]:me-2 [&>svg:first-child]:size-4"

  return (
    <Sidebar
      collapsible="icon"
      className="bg-gradient-to-b from-sidebar to-background font-body"
    >
      <SidebarHeader className="mt-11 space-y-10">
        <div className="flex items-end gap-2">
          <EthproofsIcon />
          <Link className="text-2xl font-bold italic text-body" href="/">
            Ethproofs
          </Link>

          {/* <Suspense fallback={<Skeleton className="h-8 w-12 rounded-full" />}>
            <ThemeSwitch />
          </Suspense> */}
        </div>
        {/* <SearchInput
          aria-label="search by block"
          placeholder="search by block"
        /> */}
      </SidebarHeader>

      <SidebarContent style={verticalFade}>
        <SidebarMenu
          style={verticalFade}
          className="gap-y-2 bg-background-accent/35 px-6 py-10"
        >
          <SidebarGroup>
            <SidebarGroupLabel>home</SidebarGroupLabel>
            <SidebarMenuItem>
              <Link className={customSidebarMenuItemLinkClass} href="/">
                <TrendingUp />
                <span>dashboard</span>
              </Link>
            </SidebarMenuItem>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>explore</SidebarGroupLabel>
            <SidebarMenuItem>
              <Link className={customSidebarMenuItemLinkClass} href="/zkvms">
                <Zap />
                <span>zkVMs</span>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link className={customSidebarMenuItemLinkClass} href="/clusters">
                <Cpu />
                <span>provers</span>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link className={customSidebarMenuItemLinkClass} href="/blocks">
                <Box />
                <span>blocks</span>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link className={customSidebarMenuItemLinkClass} href="/killers">
                <Bomb />
                <span>killers</span>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link className={customSidebarMenuItemLinkClass} href="/teams">
                <Users />
                <span>teams</span>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link className={customSidebarMenuItemLinkClass} href="/status">
                <HeartPulse />
                <span>status</span>
              </Link>
            </SidebarMenuItem>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>learn</SidebarGroupLabel>
            <SidebarMenuItem>
              <Link className={customSidebarMenuItemLinkClass} href="/learn">
                <Library />
                <span>learn</span>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link className={customSidebarMenuItemLinkClass} href="/api.html">
                <Target />
                <span>API</span>
              </Link>
            </SidebarMenuItem>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>contribute</SidebarGroupLabel>
            <SidebarMenuItem>
              <Link
                className={customSidebarMenuItemLinkClass}
                href={URL_GITHUB_REPO}
                hideArrow
              >
                <GitHub />
                <span>build Ethproofs</span>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link
                className={customSidebarMenuItemLinkClass}
                href={new URL(
                  SITE_REPO + "/issues/new/choose/",
                  "https://github.com"
                ).toString()}
                hideArrow
              >
                <Bug />
                <span>spot a bug?</span>
              </Link>
            </SidebarMenuItem>
          </SidebarGroup>
        </SidebarMenu>
      </SidebarContent>

      {/* <SidebarFooter>
        <div className="flex items-center gap-x-6 pb-2 font-sans font-bold [&>a]:text-2xl [&>a]:text-body">
          <Link href={URL_GITHUB_REPO} hideArrow>
            <GitHub />
          </Link>
          <Link href={URL_TWITTER} hideArrow>
            <Twitter />
          </Link>
        </div>

        <div>
          built with{" "}
          <Heart className="mb-0.5 inline size-4 text-xl text-primary motion-safe:animate-heart-beat" />{" "}
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
        <div className="text-primary">public goods are good</div>
      </SidebarFooter> */}
      {/* <SidebarRail /> */}
    </Sidebar>
  )
}

AppNavigationMenu.displayName = "AppNavigationMenu"

export default AppNavigationMenu

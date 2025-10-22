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

import EthProofsLogo from "@/components/svgs/eth-proofs-logo.svg"
import GitHub from "@/components/svgs/github.svg"
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

  const menuItemLinkClass =
    "inline-flex items-center text-body hover:text-primary [&>svg:first-child]:me-2 [&>svg:first-child]:size-4"

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
          aria-label="search by block"
          placeholder="search by block"
          insideDrawer={insideDrawer}
        />
      </SidebarHeader>

      <SidebarContent style={verticalFade}>
        <SidebarMenu
          style={verticalFade}
          className="gap-y-2 bg-background-accent/35 px-6 py-10"
        >
          <SidebarGroup>
            <SidebarGroupLabel>home</SidebarGroupLabel>
            <MenuItem>
              <Link href="/" className={menuItemLinkClass}>
                <TrendingUp />
                dashboard
              </Link>
            </MenuItem>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>explore</SidebarGroupLabel>
            <MenuItem>
              <Link href="/zkvms" className={menuItemLinkClass}>
                <Zap />
                zkVMs
              </Link>
            </MenuItem>
            <MenuItem>
              <Link href="/clusters" className={menuItemLinkClass}>
                <Cpu />
                provers
              </Link>
            </MenuItem>
            <MenuItem>
              <Link href="/blocks" className={menuItemLinkClass}>
                <Box />
                blocks
              </Link>
            </MenuItem>
            <MenuItem>
              <Link href="/killers" className={menuItemLinkClass}>
                <Bomb />
                killers
              </Link>
            </MenuItem>
            <MenuItem>
              <Link href="/teams" className={menuItemLinkClass}>
                <Users />
                teams
              </Link>
            </MenuItem>
            <MenuItem>
              <Link href="/status" className={menuItemLinkClass}>
                <HeartPulse />
                status
              </Link>
            </MenuItem>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>learn</SidebarGroupLabel>
            <MenuItem>
              <Link href="/learn" className={menuItemLinkClass}>
                <Library />
                learn
              </Link>
            </MenuItem>
            <MenuItem>
              <Link href="/api.html" className={menuItemLinkClass}>
                <Target />
                API
              </Link>
            </MenuItem>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>contribute</SidebarGroupLabel>
            <MenuItem>
              <Link
                href={URL_GITHUB_REPO}
                className={menuItemLinkClass}
                hideArrow
              >
                <GitHub />
                build Ethproofs
              </Link>
            </MenuItem>
            <MenuItem>
              <Link
                href={new URL(
                  SITE_REPO + "/issues/new/choose/",
                  "https://github.com"
                ).toString()}
                className={menuItemLinkClass}
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
      </SidebarFooter>
    </>
  )
}

AppNavigationMenu.displayName = "AppNavigationMenu"

export default AppNavigationMenu

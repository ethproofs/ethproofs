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

import GitHub from "@/components/svgs/github-logo.svg"
import XLogo from "@/components/svgs/x-logo.svg"
import Link from "@/components/ui/link"

import { URL_GITHUB_REPO, URL_TWITTER } from "@/lib/constants"
import { SITE_REPO } from "@/lib/constants"

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
import EthproofsLogomark from "./EthproofsLogomark"

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
      <SidebarHeader className="h-16">
        <EthproofsLogomark />
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
            <SidebarMenuItem>
              <Link
                className="inline-flex items-center text-body hover:text-primary"
                href={URL_TWITTER}
                hideArrow
              >
                <XLogo className="me-2 h-3 w-4" />
                <span>follow us</span>
              </Link>
            </SidebarMenuItem>
          </SidebarGroup>
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

AppNavigationMenu.displayName = "AppNavigationMenu"

export default AppNavigationMenu

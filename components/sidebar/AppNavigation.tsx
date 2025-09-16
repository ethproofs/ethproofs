import {
  Bomb,
  Box,
  Bug,
  Cpu,
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
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar"

const navigationItems = [
  {
    isActive: true,
    label: "dashboard",
    href: "/",
    icon: <TrendingUp />,
  },
  {
    label: "zkVMs",
    href: "/zkvms",
    icon: <Zap />,
  },
  {
    label: "provers",
    href: "/clusters",
    icon: <Cpu />,
  },
  {
    label: "blocks",
    href: "/blocks",
    icon: <Box />,
  },
  {
    label: "killers",
    href: "/killers",
    icon: <Bomb />,
  },
  {
    label: "teams",
    href: "/teams",
    icon: <Users />,
  },
  {
    label: "status",
    href: "/status",
    icon: <HeartPulse />,
  },
  // {
  //   label: "API",
  //   href: "/api.html",
  //   icon: <Target />,
  // },
  // {
  //   label: "learn",
  //   href: "/learn",
  //   icon: <Library />,
  // },
  // {
  // {
  //   label: "build Ethproofs",
  //   href: URL_GITHUB_REPO,
  //   icon: <GitHub />,
  // },
  // {
  //   label: "spot a bug?",
  //   href: new URL(
  //     SITE_REPO + "/issues/new/choose/",
  //     "https://github.com"
  //   ).toString(),
  //   icon: <Bug />,
  // },
  // {
  //   label: "follow us",
  //   href: URL_TWITTER,
  //   icon: <XLogo className="h-3 w-auto" />,
  // },
]

const AppNavigation = () => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>explore</SidebarGroupLabel>
      <SidebarMenu>
        {navigationItems.map((item) => (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton asChild>
              <Link
                hideArrow
                href={item.href}
                className="text-sidebar-foreground hover:text-sidebar-primary"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

AppNavigation.displayName = "AppNavigation"

export default AppNavigation

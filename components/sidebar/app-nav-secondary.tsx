"use client"

import Link from "@/components/ui/link"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import GitHub from "@/components/svgs/github-logo.svg"
import XLogo from "@/components/svgs/x-logo.svg"

import { URL_GITHUB_REPO, URL_TWITTER } from "@/lib/constants"

export const footerNavItems = [
  {
    label: "contribute",
    href: URL_GITHUB_REPO,
    icon: (
      <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
        <GitHub className="h-4 w-4" />
      </span>
    ),
  },
  {
    label: "follow",
    href: URL_TWITTER,
    icon: (
      <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
        <XLogo className="h-3.5 w-3.5" />
      </span>
    ),
  },
]

export function AppNavSecondary() {
  return (
    <SidebarGroup className="mt-auto">
      <SidebarGroupContent>
        <SidebarMenu>
          {footerNavItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                className="text-muted-foreground hover:bg-transparent focus:bg-transparent focus:text-muted-foreground"
              >
                <Link hideArrow href={item.href}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

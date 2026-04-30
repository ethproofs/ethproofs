"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"

import Link from "@/components/ui/link"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Separator } from "../ui/separator"

import {
  benchmarksNavItems,
  cohortsNavItems,
  exploreNavItems,
  moreNavItems,
} from "./nav-items"

export function AppNavigation() {
  const pathname = usePathname()
  const items = useMemo(
    () => [
      ...cohortsNavItems,
      ...exploreNavItems,
      ...benchmarksNavItems,
      ...moreNavItems,
    ],
    []
  )
  const [activeItem, setActiveItem] = useState<(typeof items)[0] | null>(null)

  useEffect(() => {
    setActiveItem(items.find((item) => item.href === pathname) ?? null)
  }, [items, pathname])

  return (
    <SidebarGroup>
      <Separator className="my-2" />
      <SidebarGroupLabel>coming soon</SidebarGroupLabel>
      <SidebarMenu>
        {cohortsNavItems.map((item) =>
          item.isDisabled ? (
            <SidebarMenuItem key={item.label}>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      aria-disabled
                      className="cursor-not-allowed text-sidebar-foreground aria-disabled:pointer-events-auto"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  {/* <TooltipContent side="bottom">
                    <p className="text-xs">
                      {item.disabledReason ?? "coming soon"}
                    </p>
                  </TooltipContent> */}
                </Tooltip>
              </TooltipProvider>
            </SidebarMenuItem>
          ) : (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={item.label === activeItem?.label}
              >
                <Link
                  hideArrow
                  href={item.href}
                  className="text-sidebar-foreground hover:text-sidebar-primary"
                  onClick={() => setActiveItem(item)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
      <Separator className="my-2" />
      <SidebarGroupLabel>explore</SidebarGroupLabel>
      <SidebarMenu>
        {exploreNavItems.map((item) => (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton
              asChild
              isActive={item.label === activeItem?.label}
            >
              <Link
                hideArrow
                href={item.href}
                className="text-sidebar-foreground hover:text-sidebar-primary"
                onClick={() => setActiveItem(item)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <Separator className="my-2" />
      <SidebarGroupLabel>client-side proving</SidebarGroupLabel>
      <SidebarMenu>
        {benchmarksNavItems.map((item) => (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton
              asChild
              isActive={item.label === activeItem?.label}
            >
              <Link
                hideArrow
                href={item.href}
                className="text-sidebar-foreground hover:text-sidebar-primary"
                onClick={() => setActiveItem(item)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <Separator className="my-2" />
      <SidebarGroupLabel>more</SidebarGroupLabel>
      <SidebarMenu>
        {moreNavItems.map((item) => (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton
              asChild
              isActive={item.label === activeItem?.label}
            >
              <Link
                hideArrow
                href={item.href}
                className="text-sidebar-foreground hover:text-sidebar-primary"
                onClick={() => setActiveItem(item)}
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

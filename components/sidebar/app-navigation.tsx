"use client"

import Link from "@/components/ui/link"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { exploreNavItems, moreNavItems } from "./nav-items"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function AppNavigation() {
  const pathname = usePathname()
  const items = [...exploreNavItems, ...moreNavItems]
  const [activeItem, setActiveItem] = useState<(typeof items)[0] | null>(null)

  useEffect(() => {
    setActiveItem(items.find((item) => item.href === pathname) ?? null)
  }, [pathname])

  return (
    <SidebarGroup>
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
      {/* <SidebarGroupLabel>more</SidebarGroupLabel>
      <SidebarMenu>
        {moreNavItems.map((item) => (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton
              asChild
              isActive={item.label === activeItem.label}
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
      </SidebarMenu> */}
    </SidebarGroup>
  )
}

"use client"

import { LayoutDashboard } from "lucide-react"
import Link from "next/link"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface DashboardButtonProps {
  teamSlug: string
}

export function DashboardButton({ teamSlug }: DashboardButtonProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          variant="outline"
          tooltip="dashboard"
          className="justify-center"
        >
          <Link href={`/teams/${teamSlug}/dashboard`}>
            <LayoutDashboard className="hidden group-data-[collapsible=icon]:block" />
            <span className="group-data-[collapsible=icon]:hidden">
              dashboard
            </span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

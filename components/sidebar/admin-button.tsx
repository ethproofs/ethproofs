"use client"

import { ShieldCheck } from "lucide-react"
import Link from "next/link"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AdminButton() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          variant="outline"
          tooltip="admin"
          className="justify-center"
        >
          <Link href="/admin">
            <ShieldCheck className="hidden group-data-[collapsible=icon]:block" />
            <span className="group-data-[collapsible=icon]:hidden">admin</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

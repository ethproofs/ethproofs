"use client"

import { LogIn } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function SignInButton() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          variant="outline"
          tooltip="sign in"
          className="justify-center cursor-not-allowed opacity-50"
          disabled
        >
          <LogIn className="hidden group-data-[collapsible=icon]:block" />
          <span className="group-data-[collapsible=icon]:hidden">sign in</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

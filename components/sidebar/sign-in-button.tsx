"use client"

import { LogIn } from "lucide-react"
import Link from "next/link"

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
          asChild
          variant="outline"
          tooltip="sign in"
          className="justify-center"
        >
          <Link href="/sign-in">
            <LogIn className="hidden group-data-[collapsible=icon]:block" />
            <span className="group-data-[collapsible=icon]:hidden">
              sign in
            </span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

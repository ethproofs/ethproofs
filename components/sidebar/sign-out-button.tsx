"use client"

import { useTransition } from "react"
import { LogOut } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { signOut } from "@/app/admin/actions"

export function SignOutButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          variant="outline"
          disabled={isPending}
          onClick={() => startTransition(() => signOut())}
          tooltip={isPending ? "signing out..." : "sign out"}
          className="justify-center"
        >
          <LogOut className="hidden group-data-[collapsible=icon]:block" />
          <span className="group-data-[collapsible=icon]:hidden">
            {isPending ? "signing out..." : "sign out"}
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

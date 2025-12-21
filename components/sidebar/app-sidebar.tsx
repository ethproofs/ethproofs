import { SignInButton } from "../sign-in-button"
import { SignOutButton } from "../sign-out-button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "../ui/sidebar"

import { AppNavSecondary } from "./app-nav-secondary"
import { AppNavigation } from "./app-navigation"
import { AppSidebarHeader } from "./app-sidebar-header"

import { createClient } from "@/utils/supabase/server"

export async function AppSidebar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return (
    <Sidebar collapsible="icon" className="h-full bg-sidebar">
      <SidebarHeader className="h-16 items-center justify-center">
        <AppSidebarHeader />
      </SidebarHeader>
      <SidebarContent>
        <AppNavigation />
        <AppNavSecondary />
      </SidebarContent>
      <SidebarFooter>
        {user ? <SignOutButton /> : <SignInButton />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

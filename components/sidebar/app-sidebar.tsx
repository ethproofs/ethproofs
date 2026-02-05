import { API_KEY_MANAGER_ROLE } from "@/lib/constants"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "../ui/sidebar"

import { AdminButton } from "./admin-button"
import { AppNavSecondary } from "./app-nav-secondary"
import { AppNavigation } from "./app-navigation"
import { AppSidebarHeader } from "./app-sidebar-header"
import { DashboardButton } from "./dashboard-button"
import { SignInButton } from "./sign-in-button"
import { SignOutButton } from "./sign-out-button"

import { getTeam } from "@/lib/api/teams"
import { createClient } from "@/utils/supabase/server"

export async function AppSidebar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAdmin = user?.role === API_KEY_MANAGER_ROLE
  const team = user ? await getTeam(user.id) : null

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
        {user ? (
          <>
            {isAdmin && <AdminButton />}
            {team && <DashboardButton teamSlug={team.slug} />}
            <SignOutButton />
          </>
        ) : (
          <SignInButton />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

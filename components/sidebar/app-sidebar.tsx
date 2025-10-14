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

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" className="h-full bg-sidebar">
      <SidebarHeader className="h-16 items-center justify-center">
        <AppSidebarHeader />
      </SidebarHeader>
      <SidebarContent>
        <AppNavigation />
        <AppNavSecondary />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

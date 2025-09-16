import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "../ui/sidebar"

import AppNavigation from "./AppNavigation"
import AppSidebarHeader from "./AppSidebarHeader"

const AppSidebar = () => {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <AppSidebarHeader />
      </SidebarHeader>
      <SidebarContent>
        <AppNavigation />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

AppSidebar.displayName = "AppSidebar"

export default AppSidebar

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "../ui/sidebar"
import EthproofsLogomark from "../EthproofsLogomark"
import AppNavigation from "./AppNavigation"

const AppSidebar = () => {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16">
        <EthproofsLogomark />
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

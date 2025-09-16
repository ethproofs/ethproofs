import EthproofsIcon from "@/components/svgs/ethproofs-icon.svg"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "../ui/sidebar"

import AppNavigation from "./AppNavigation"

const AppSidebar = () => {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16">
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <EthproofsIcon />
          </div>
          <div className="grid flex-1 text-left font-heading text-xl leading-tight">
            Ethproofs
          </div>
        </SidebarMenuButton>
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

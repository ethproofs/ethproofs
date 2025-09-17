import EthproofsIcon from "@/components/svgs/ethproofs-icon.svg"

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar"

export default function AppSidebarHeader() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
            <EthproofsIcon />
          </div>
          <div className="grid flex-1 text-left font-heading text-2xl leading-tight">
            Ethproofs
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

import EthproofsIcon from "@/components/svgs/ethproofs-icon.svg"

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar"

export default function AppSidebarHeader() {
  return (
    <SidebarMenu>
      <SidebarMenuItem className="data-[state=closed]:h-12">
        <SidebarMenuButton
          size="lg"
          className="gap-1"
          // className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground gap-1"
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <EthproofsIcon />
          </div>
          <div className="flex flex-row gap-0 text-left text-2xl leading-tight">
            <div className="font-heading">Eth</div>
            <div>proofs</div>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

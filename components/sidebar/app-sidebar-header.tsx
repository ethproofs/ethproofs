import EthproofsIcon from "@/components/svgs/ethproofs-icon.svg"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebarHeader() {
  return (
    <SidebarMenu>
      <SidebarMenuItem className="data-[state=closed]:h-12">
        <SidebarMenuButton size="lg" className="gap-1">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <EthproofsIcon />
          </div>
          <div className="flex flex-row gap-0 text-left text-xl">
            <div className="font-heading">Eth</div>
            <div>proofs</div>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

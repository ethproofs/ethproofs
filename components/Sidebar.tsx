import { Suspense } from "react"
import { ChevronUp, User2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu"

import EthProofsLogo from "@/components/svgs/eth-proofs-logo.svg"
import GitHub from "@/components/svgs/github.svg"
import Heart from "@/components/svgs/heart.svg"

import { SITE_NAME, SITE_REPO } from "@/lib/constants"

import SearchInput from "./header/SearchInput"
import ThemeSwitch from "./header/ThemeSwitch"
import { ButtonLink } from "./ui/button"
import Link from "./ui/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "./ui/sidebar"
import { Skeleton } from "./ui/skeleton"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="my-11 space-y-10 px-6">
        <div className="flex items-end justify-between gap-4">
          <Link href="/">
            <EthProofsLogo className="text-[2.625rem] text-body" />
          </Link>

          <Suspense fallback={<Skeleton className="h-8 w-12 rounded-full" />}>
            <ThemeSwitch />
          </Suspense>
        </div>
        <SearchInput className="max-md:hidden" placeholder="Search by block" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="space-y-10 px-6">
          <SidebarGroup className="">
            <SidebarGroupLabel className="">Home</SidebarGroupLabel>
            <SidebarMenuItem className="">Dashboard</SidebarMenuItem>
          </SidebarGroup>
          <SidebarGroup className="">
            <SidebarGroupLabel className="">Explore</SidebarGroupLabel>
            <SidebarMenuItem className="">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="[&>svg]:rotate-180 [&[data-state=open]>svg]:rotate-0">
                    <>
                      zkVMs
                      <ChevronUp className="ms-auto" />
                    </>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="bottom"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem>
                    <span>Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Billing</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
            <SidebarMenuItem className="">provers</SidebarMenuItem>
            <SidebarMenuItem className="">blocks</SidebarMenuItem>
            <SidebarMenuItem className="">killers</SidebarMenuItem>
          </SidebarGroup>
          <SidebarGroup className="">
            <SidebarGroupLabel className="">Learn</SidebarGroupLabel>
            <SidebarMenuItem className="">Item 1</SidebarMenuItem>
            <SidebarMenuItem className="">Item 2</SidebarMenuItem>
            <SidebarMenuItem className="">Item 3</SidebarMenuItem>
          </SidebarGroup>
          {/* <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                <User2 /> Username
                <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem> */}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="mx-auto mt-16 flex max-w-prose flex-col items-center space-y-4">
        {/* <footer className="mx-auto mt-16 flex max-w-prose flex-col items-center"> */}
        {/* <ButtonLink
            size="lg"
            href={new URL(SITE_REPO, "https://github.com").toString()}
            className="mb-12"
          >
            <GitHub className="size-6" />
            <span>Contribute to {SITE_NAME}</span>
          </ButtonLink>
          */}

        <p className="mb-4 text-center">
          Built with{" "}
          <Heart className="mb-0.5 inline animate-heart-beat text-xl text-primary" />{" "}
          by the{" "}
          <Link
            href="https://ethereum.org"
            hideArrow
            className="hover:text-primary-light"
          >
            ethereum.org
          </Link>{" "}
          team
        </p>
        <p className="text-center text-lg text-primary">
          Public goods are good
        </p>

        <Link
          href={new URL(
            SITE_REPO + "/issues/new/choose/",
            "https://github.com"
          ).toString()}
          className="text-center font-body text-body-secondary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Spot a bug? Report it here
        </Link>
      </SidebarFooter>
    </Sidebar>
  )
}

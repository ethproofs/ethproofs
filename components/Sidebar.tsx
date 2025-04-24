import { Suspense } from "react"

import EthProofsLogo from "@/components/svgs/eth-proofs-logo.svg"
import Heart from "@/components/svgs/heart.svg"

import { SITE_REPO } from "@/lib/constants"

import SearchInput from "./header/SearchInput"
import ThemeSwitch from "./header/ThemeSwitch"
import Link from "./ui/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
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
        <SidebarMenu className="gap-y-10 px-6">
          <SidebarGroup className="">
            <SidebarGroupLabel className="">Home</SidebarGroupLabel>
            <Link href="/" className="text-body hover:text-primary">
              <SidebarMenuItem>Dashboard</SidebarMenuItem>
            </Link>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Explore</SidebarGroupLabel>
            <Link href="/zkvms" className="text-body hover:text-primary">
              <SidebarMenuItem>zkVMs</SidebarMenuItem>
            </Link>
            <Link href="/provers" className="text-body hover:text-primary">
              <SidebarMenuItem>provers</SidebarMenuItem>
            </Link>
            <Link href="/blocks" className="text-body hover:text-primary">
              <SidebarMenuItem>blocks</SidebarMenuItem>
            </Link>
            <Link href="/killers" className="text-body hover:text-primary">
              <SidebarMenuItem>killers</SidebarMenuItem>
            </Link>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Learn</SidebarGroupLabel>
            <Link href="/learn" className="text-body hover:text-primary">
              <SidebarMenuItem>zkVMs and SNARKs</SidebarMenuItem>
            </Link>
            <Link href="/#?" className="text-body hover:text-primary">
              <SidebarMenuItem>blocks</SidebarMenuItem>
            </Link>
            <Link href="/api.html" className="text-body hover:text-primary">
              <SidebarMenuItem>API</SidebarMenuItem>
            </Link>
            <Link href="/#?" className="text-body hover:text-primary">
              <SidebarMenuItem>about Ethproofs</SidebarMenuItem>
            </Link>
          </SidebarGroup>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="mx-auto mt-16 flex max-w-prose flex-col items-center space-y-4">
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

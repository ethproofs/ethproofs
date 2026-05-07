"use client"

import { useCallback, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"

import type { Block, Team } from "@/lib/types"

import { TabbedSection, TabsContent } from "@/components/ui/tabbed-section"

import { BlockDrawer } from "./block-drawer"
import { BlocksTable } from "./blocks-table"

import type { MachineType } from "@/lib/api/blocks"
import { mergeBlocksWithTeams } from "@/lib/blocks"

const BLOCK_PARAM = "block"

const MACHINE_TABS: Array<{ value: MachineType; label: string }> = [
  { value: "multi", label: "multi-gpu" },
  { value: "single", label: "single-gpu" },
]

function isMachineType(value: string): value is MachineType {
  return MACHINE_TABS.some((tab) => tab.value === value)
}

interface BlocksTabbedTableProps {
  teams: Team[]
}

export function BlocksTabbedTable({ teams }: BlocksTabbedTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState<MachineType>("multi")

  const blockParam = searchParams.get(BLOCK_PARAM)
  const drawerOpen = Boolean(blockParam)

  const { data: fetchedBlock, isLoading } = useQuery<Block | null>({
    queryKey: ["block-detail", blockParam],
    queryFn: async () => {
      const response = await fetch(`/api/blocks/${blockParam}`)
      if (!response.ok) return null
      return response.json()
    },
    enabled: Boolean(blockParam),
    staleTime: 60 * 1000,
  })

  const selectedBlock = useMemo<Block | null>(() => {
    if (!fetchedBlock) return null
    const [merged] = mergeBlocksWithTeams([fetchedBlock], teams)
    return merged
  }, [fetchedBlock, teams])

  const handleOpenDrawer = useCallback(
    (block: Block) => {
      const next = new URLSearchParams(searchParams.toString())
      next.set(BLOCK_PARAM, String(block.block_number))
      router.replace(`${pathname}?${next.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open || !blockParam) return
      const next = new URLSearchParams(searchParams.toString())
      next.delete(BLOCK_PARAM)
      const query = next.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      })
    },
    [blockParam, pathname, router, searchParams]
  )

  function handleTabChange(value: string) {
    if (isMachineType(value)) {
      setActiveTab(value)
    }
  }

  return (
    <>
      <TabbedSection
        tabs={MACHINE_TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabsListClassName="grid-cols-2"
      >
        {MACHINE_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <BlocksTable
              machineType={activeTab}
              teams={teams}
              onOpenDrawer={handleOpenDrawer}
            />
          </TabsContent>
        ))}
      </TabbedSection>
      <BlockDrawer
        open={drawerOpen}
        onOpenChange={handleOpenChange}
        block={selectedBlock}
        isLoading={isLoading}
      />
    </>
  )
}

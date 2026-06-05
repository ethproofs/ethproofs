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
import type { BlocksQueryResult } from "@/lib/hooks/queries/use-blocks-query"

const BLOCK_PARAM = "block"

const MACHINE_TABS: Array<{ value: MachineType; label: string }> = [
  { value: "multi", label: "multi-gpu" },
  { value: "single", label: "single-gpu" },
]

function isMachineType(value: string): value is MachineType {
  return MACHINE_TABS.some((tab) => tab.value === value)
}

function getOtherMachineType(active: MachineType): MachineType | undefined {
  const other = MACHINE_TABS.find((tab) => tab.value !== active)
  return other?.value
}

interface BlocksTabbedTableProps {
  teams: Team[]
  initialBlocksByMachine: Partial<Record<MachineType, BlocksQueryResult>>
}

export function BlocksTabbedTable({
  teams,
  initialBlocksByMachine,
}: BlocksTabbedTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState<MachineType>("multi")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null)

  const blockParam = searchParams.get(BLOCK_PARAM)
  const fetchKey =
    selectedBlock?.block_number !== undefined
      ? String(selectedBlock.block_number)
      : blockParam

  const { data: fetchedBlock, isLoading: isFetchLoading } =
    useQuery<Block | null>({
      queryKey: ["block-detail", fetchKey],
      queryFn: async () => {
        const response = await fetch(`/api/blocks/${fetchKey}`)
        if (!response.ok) return null
        return response.json()
      },
      enabled: Boolean(fetchKey),
      staleTime: 60 * 1000,
    })

  const fullBlock = useMemo<Block | null>(() => {
    if (!fetchedBlock) return null
    const [merged] = mergeBlocksWithTeams([fetchedBlock], teams)
    return merged
  }, [fetchedBlock, teams])

  const drawerBlock = fullBlock ?? selectedBlock
  const open = drawerOpen || Boolean(blockParam)
  const isLoading = !drawerBlock && isFetchLoading

  const handleOpenDrawer = useCallback(
    (block: Block) => {
      setSelectedBlock(block)
      setDrawerOpen(true)
      const next = new URLSearchParams(searchParams.toString())
      next.set(BLOCK_PARAM, String(block.block_number))
      router.replace(`${pathname}?${next.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setDrawerOpen(open)
      if (!open) {
        setSelectedBlock(null)
        if (searchParams.get(BLOCK_PARAM)) {
          const next = new URLSearchParams(searchParams.toString())
          next.delete(BLOCK_PARAM)
          const query = next.toString()
          router.replace(query ? `${pathname}?${query}` : pathname, {
            scroll: false,
          })
        }
      }
    },
    [pathname, router, searchParams]
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
              initialData={initialBlocksByMachine[activeTab]}
              otherTabMachineType={getOtherMachineType(activeTab)}
            />
          </TabsContent>
        ))}
      </TabbedSection>
      <BlockDrawer
        open={open}
        onOpenChange={handleOpenChange}
        block={drawerBlock}
        isLoading={isLoading}
      />
    </>
  )
}

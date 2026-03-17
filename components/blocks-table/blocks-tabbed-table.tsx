"use client"

import { useState } from "react"

import type { Team } from "@/lib/types"

import { TabbedSection, TabsContent } from "@/components/ui/tabbed-section"

import { BlocksTable } from "./blocks-table"

import type { MachineType } from "@/lib/api/blocks"

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
  const [activeTab, setActiveTab] = useState<MachineType>("multi")

  function handleTabChange(value: string) {
    if (isMachineType(value)) {
      setActiveTab(value)
    }
  }

  return (
    <TabbedSection
      tabs={MACHINE_TABS}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      {MACHINE_TABS.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          <BlocksTable machineType={activeTab} teams={teams} />
        </TabsContent>
      ))}
    </TabbedSection>
  )
}

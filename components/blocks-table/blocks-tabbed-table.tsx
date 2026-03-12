"use client"

import { useState } from "react"

import type { Team } from "@/lib/types"

import { TabbedSection, TabsContent } from "@/components/ui/tabbed-section"

import { BlocksTable } from "./blocks-table"

import type { MachineType } from "@/lib/api/blocks"

const MACHINE_TABS = [
  { value: "multi" as MachineType, label: "multi-gpu" },
  { value: "single" as MachineType, label: "single-gpu" },
]

interface BlocksTabbedTableProps {
  teams: Team[]
}

export function BlocksTabbedTable({ teams }: BlocksTabbedTableProps) {
  const [activeTab, setActiveTab] = useState<string>("multi")

  return (
    <TabbedSection
      tabs={MACHINE_TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {MACHINE_TABS.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          <BlocksTable machineType={activeTab as MachineType} teams={teams} />
        </TabsContent>
      ))}
    </TabbedSection>
  )
}

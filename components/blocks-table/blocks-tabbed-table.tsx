"use client"

import { useState } from "react"

import type { Team } from "@/lib/types"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { BlocksTable } from "./blocks-table"

import type { MachineType } from "@/lib/api/blocks"

const MACHINE_TABS: { value: MachineType; label: string }[] = [
  { value: "multi", label: "multi-gpu" },
  { value: "single", label: "single-gpu" },
]

interface BlocksTabbedTableProps {
  teams: Team[]
}

export function BlocksTabbedTable({ teams }: BlocksTabbedTableProps) {
  const [activeTab, setActiveTab] = useState<MachineType>("multi")

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as MachineType)}
    >
      <TabsList className="border-none">
        {MACHINE_TABS.map((tab) => (
          <TabsTrigger
            key={tab.value}
            className="flex-1 cursor-default border-none py-1"
            value={tab.value}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {MACHINE_TABS.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          <BlocksTable machineType={activeTab} teams={teams} />
        </TabsContent>
      ))}
    </Tabs>
  )
}

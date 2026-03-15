"use client"

import { useState } from "react"

import type { RtpCohortRow } from "@/lib/types"

import {
  TabbedSection,
  type TabbedSectionTab,
  TabsContent,
} from "@/components/ui/tabbed-section"

import { RtpCohortTable } from "./rtp-cohort-table"

const COHORT_TABS: TabbedSectionTab[] = [
  { value: "rtp", label: "RTP cohort" },
  {
    value: "1-10",
    label: "1:10 cohort (soon™)",
    isDisabled: true,
    disabledReason: "coming soon",
  },
]

interface RtpCohortTabbedTableProps {
  rows: RtpCohortRow[]
}

export function RtpCohortTabbedTable({ rows }: RtpCohortTabbedTableProps) {
  const [activeTab, setActiveTab] = useState("rtp")

  return (
    <TabbedSection
      tabs={COHORT_TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <TabsContent value="rtp">
        <RtpCohortTable rows={rows} />
      </TabsContent>
    </TabbedSection>
  )
}

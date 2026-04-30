"use client"

import { useState } from "react"

import type { CohortRow } from "@/lib/types"

import { CohortTable } from "@/components/cohorts/cohort-table/cohort-table"
import { EmptyCohortBanner } from "@/components/cohorts/empty-cohort-banner"
import { TabbedSection, TabsContent } from "@/components/ui/tabbed-section"

const TAB_ELIGIBLE = "eligible"
const TAB_INELIGIBLE = "ineligible"

interface RtpCohortTabsProps {
  eligibleRows: CohortRow[]
  ineligibleRows: CohortRow[]
}

export function RtpCohortTabs({
  eligibleRows,
  ineligibleRows,
}: RtpCohortTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(TAB_ELIGIBLE)

  const tabs = [
    { value: TAB_ELIGIBLE, label: "RTP cohort" },
    {
      value: TAB_INELIGIBLE,
      label: "evaluated, not eligible",
      isDisabled: ineligibleRows.length === 0,
      disabledReason:
        eligibleRows.length === 0
          ? "no provers evaluated this week"
          : "all evaluated provers were eligible",
    },
  ]

  return (
    <TabbedSection
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabsListClassName="grid-cols-2"
    >
      <TabsContent value={TAB_ELIGIBLE}>
        {eligibleRows.length === 0 ? (
          <EmptyCohortBanner />
        ) : (
          <CohortTable rows={eligibleRows} />
        )}
      </TabsContent>
      <TabsContent value={TAB_INELIGIBLE}>
        <CohortTable rows={ineligibleRows} />
      </TabsContent>
    </TabbedSection>
  )
}

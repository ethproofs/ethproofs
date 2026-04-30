"use client"

import { useState } from "react"

import type { CohortRow } from "@/lib/types"

import { CohortTable } from "@/components/cohorts/cohort-table/cohort-table"
import { EmptyCohortBanner } from "@/components/cohorts/empty-cohort-banner"
import { TabbedSection, TabsContent } from "@/components/ui/tabbed-section"

const TAB_ELIGIBLE = "eligible"
const TAB_INELIGIBLE = "ineligible"

const TABS = [
  { value: TAB_ELIGIBLE, label: "RTP cohort" },
  { value: TAB_INELIGIBLE, label: "evaluated, not eligible" },
]

interface RtpCohortTabsProps {
  eligibleRows: CohortRow[]
  ineligibleRows: CohortRow[]
}

export function RtpCohortTabs({
  eligibleRows,
  ineligibleRows,
}: RtpCohortTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(TAB_ELIGIBLE)

  return (
    <TabbedSection
      tabs={TABS}
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
        {ineligibleRows.length === 0 ? (
          <p className="px-1 py-4 text-sm text-muted-foreground">
            no evaluated provers fell short of eligibility this week
          </p>
        ) : (
          <CohortTable rows={ineligibleRows} />
        )}
      </TabsContent>
    </TabbedSection>
  )
}

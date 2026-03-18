"use client"

import { useState } from "react"

import type { RtpCohortRow } from "@/lib/types"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
}

function formatCohortRange(): string {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  return `${weekAgo.toLocaleDateString("en-US", DATE_FORMAT)} – ${now.toLocaleDateString("en-US", DATE_FORMAT)}`
}

function EmptyCohortBanner() {
  return (
    <Card className="border-none bg-warning/10">
      <CardContent className="flex items-stretch gap-6 pt-6">
        <div className="flex flex-col items-center justify-center gap-2">
          <Badge variant="outline" className="px-3 py-1 text-sm text-warning">
            <div className="mr-1.5 size-2 rounded-full bg-warning" />
            no cohort
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatCohortRange()}
          </span>
        </div>
        <div className="w-px self-stretch bg-border" />
        <div className="flex flex-col justify-center gap-1">
          <span className="text-sm font-medium">
            no provers are eligible for the RTP cohort this week
          </span>
          <span className="text-xs text-muted-foreground">
            provers must meet all requirements and hit score targets to be
            included in the cohort
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export function RtpCohortTabbedTable({ rows }: RtpCohortTabbedTableProps) {
  const [activeTab, setActiveTab] = useState("rtp")

  if (rows.length === 0) return <EmptyCohortBanner />

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

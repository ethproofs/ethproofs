"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { DataTable } from "@/components/data-table/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { TabbedSection, TabsContent } from "@/components/ui/tabbed-section"

import { cn } from "@/lib/utils"

import { DEFAULT_PAGE_STATE } from "@/lib/constants"

import { teamsTableColumns } from "./teams-table-columns"

import type { TeamsTableData, TeamTableRow } from "@/lib/api/teams-metrics"

const TAB_ALL = "all"
const TAB_ZKVM = "zkvm"
const TAB_GUEST = "guest"
const TAB_PROVER = "prover"

type TeamTab =
  | typeof TAB_ALL
  | typeof TAB_ZKVM
  | typeof TAB_GUEST
  | typeof TAB_PROVER

const TAB_LABELS: Record<TeamTab, string> = {
  [TAB_ALL]: "all teams",
  [TAB_ZKVM]: "zkVM maintainers",
  [TAB_GUEST]: "guest maintainers",
  [TAB_PROVER]: "prover operators",
}

const TAB_DISABLED_REASONS: Record<TeamTab, string> = {
  [TAB_ALL]: "",
  [TAB_ZKVM]: "no zkVM maintainers",
  [TAB_GUEST]: "no guest maintainers",
  [TAB_PROVER]: "no prover operators",
}

const TAB_ORDER: TeamTab[] = [TAB_ALL, TAB_ZKVM, TAB_GUEST, TAB_PROVER]

function isTeamTab(value: string): value is TeamTab {
  return TAB_ORDER.includes(value as TeamTab)
}

function filterTeamsByTab(teams: TeamTableRow[], tab: TeamTab): TeamTableRow[] {
  if (tab === TAB_ALL) return teams
  if (tab === TAB_ZKVM) return teams.filter((t) => t.zkvmCount > 0)
  if (tab === TAB_GUEST) return teams.filter((t) => t.guestCount > 0)
  return teams.filter((t) => t.proverCount > 0)
}

function countForTab(teams: TeamTableRow[], tab: TeamTab): number {
  return filterTeamsByTab(teams, tab).length
}

export function TeamsTabbedTable() {
  const [activeTab, setActiveTab] = useState<TeamTab>(TAB_ALL)
  const [pagination, setPagination] =
    useState<PaginationState>(DEFAULT_PAGE_STATE)

  const { data, isLoading } = useQuery<TeamsTableData>({
    queryKey: ["teams-table"],
    queryFn: async () => {
      const response = await fetch("/api/teams/table")
      return response.json()
    },
  })

  const teams = useMemo(() => data?.teams ?? [], [data])

  const tabs = useMemo(
    () =>
      TAB_ORDER.map((value) => {
        const count = countForTab(teams, value)
        return {
          value,
          label: TAB_LABELS[value],
          count,
          isDisabled: value !== TAB_ALL && count === 0,
          disabledReason: TAB_DISABLED_REASONS[value],
        }
      }),
    [teams]
  )

  const filteredTeams = useMemo(
    () => filterTeamsByTab(teams, activeTab),
    [teams, activeTab]
  )

  const HEADER_HEIGHT_PX = 50
  const ROW_HEIGHT_PX = 59
  const minTableHeight = teams.length * ROW_HEIGHT_PX + HEADER_HEIGHT_PX

  if (isLoading) {
    return <Skeleton className="h-[32rem] w-full rounded-lg" />
  }

  return (
    <TabbedSection
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(v) => {
        if (isTeamTab(v)) {
          setActiveTab(v)
          setPagination(DEFAULT_PAGE_STATE)
        }
      }}
    >
      {TAB_ORDER.map((value) => (
        <TabsContent key={value} value={value}>
          <DataTable
            className={cn(
              "[&>div]:max-h-none",
              filteredTeams.length > 0 && "[&_tbody_tr:last-child]:border-b"
            )}
            data={filteredTeams}
            columns={teamsTableColumns}
            rowCount={filteredTeams.length}
            pagination={pagination}
            setPagination={setPagination}
            showToolbar={false}
            showPagination={filteredTeams.length > DEFAULT_PAGE_STATE.pageSize}
            minHeight={minTableHeight}
          />
        </TabsContent>
      ))}
    </TabbedSection>
  )
}

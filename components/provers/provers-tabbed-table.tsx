"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import type { ProverType } from "@/lib/types"

import type { ClusterRow } from "@/components/clusters-table/clusters-table"
import { ClustersTable } from "@/components/clusters-table/clusters-table"
import { Skeleton } from "@/components/ui/skeleton"
import { TabbedSection, TabsContent } from "@/components/ui/tabbed-section"

import { cn } from "@/lib/utils"

const ALL_TAB = "all"

interface TableData {
  clusters: ClusterRow[]
  proverTypes: ProverType[]
}

export function ProversTabbedTable() {
  const [activeTab, setActiveTab] = useState(ALL_TAB)

  const { data, isLoading } = useQuery<TableData>({
    queryKey: ["provers-table"],
    queryFn: async () => {
      const response = await fetch("/api/provers/table")
      return response.json()
    },
  })

  const clusters = useMemo(() => data?.clusters ?? [], [data])
  const proverTypes = useMemo(() => data?.proverTypes ?? [], [data])

  const clusterCountByType = useMemo(() => {
    const counts = new Map<string, number>()
    for (const c of clusters) {
      const key = String(c.prover_type_id)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  }, [clusters])

  const filteredClusters = useMemo(
    () =>
      activeTab === ALL_TAB
        ? clusters
        : clusters.filter((c) => String(c.prover_type_id) === activeTab),
    [clusters, activeTab]
  )

  const tabs = useMemo(
    () => [
      { value: ALL_TAB, label: "provers, active" },
      ...proverTypes.map((pt) => {
        const count = clusterCountByType.get(String(pt.id)) ?? 0
        return {
          value: String(pt.id),
          label: pt.name.toLowerCase(),
          isDisabled: count === 0,
          disabledReason: "no active provers",
        }
      }),
    ],
    [proverTypes, clusterCountByType]
  )

  const tabValues = useMemo(
    () => [ALL_TAB, ...proverTypes.map((pt) => String(pt.id))],
    [proverTypes]
  )

  const HEADER_HEIGHT_PX = 50
  const ROW_HEIGHT_PX = 77
  const minTableHeight = clusters.length * ROW_HEIGHT_PX + HEADER_HEIGHT_PX

  if (isLoading) {
    return <Skeleton className="h-[32rem] w-full rounded-lg" />
  }

  return (
    <TabbedSection tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
      {tabValues.map((value) => (
        <TabsContent key={value} value={value}>
          <ClustersTable
            className={cn(
              "[&>div]:max-h-none",
              filteredClusters.length > 0 && "[&_tbody_tr:last-child]:border-b"
            )}
            clusters={filteredClusters}
            minHeight={minTableHeight}
          />
        </TabsContent>
      ))}
    </TabbedSection>
  )
}

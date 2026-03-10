"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import type { ProverType } from "@/lib/types"

import type { ClusterRow } from "@/components/clusters-table/clusters-table"
import { ClustersTable } from "@/components/clusters-table/clusters-table"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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

  const tabValues = [ALL_TAB, ...proverTypes.map((pt) => String(pt.id))]

  if (isLoading) {
    return <Skeleton className="h-[32rem] w-full rounded-lg" />
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="border-none">
        <TabsTrigger
          className="flex-1 cursor-default border-none py-1"
          value={ALL_TAB}
        >
          provers, active
        </TabsTrigger>
        {proverTypes.map((pt) => {
          const count = clusterCountByType.get(String(pt.id)) ?? 0
          const isDisabled = count === 0
          const trigger = (
            <TabsTrigger
              key={pt.id}
              className="flex-1 cursor-default border-none py-1"
              value={String(pt.id)}
              disabled={isDisabled}
            >
              {pt.name.toLowerCase()}
            </TabsTrigger>
          )

          if (!isDisabled) return trigger

          return (
            <TooltipProvider key={pt.id} delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex-1">{trigger}</span>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">no active provers</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </TabsList>
      {tabValues.map((value) => (
        <TabsContent key={value} value={value}>
          <ClustersTable
            className={cn(
              "[&>div]:max-h-none",
              filteredClusters.length > 0 && "[&_tbody_tr:last-child]:border-b"
            )}
            clusters={filteredClusters}
          />
        </TabsContent>
      ))}
    </Tabs>
  )
}

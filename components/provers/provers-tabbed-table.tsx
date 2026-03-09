"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import type { ProverType } from "@/lib/types"

import type { ClusterRow } from "@/components/clusters-table/clusters-table"
import { ClustersTable } from "@/components/clusters-table/clusters-table"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
        {proverTypes.map((pt) => (
          <TabsTrigger
            key={pt.id}
            className="flex-1 cursor-default border-none py-1"
            value={String(pt.id)}
          >
            {pt.name.toLowerCase()}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabValues.map((value) => (
        <TabsContent key={value} value={value}>
          <ClustersTable
            className={cn(
              "h-[32rem] [&>div]:h-full [&>div]:max-h-none",
              filteredClusters.length > 0 && "[&_tbody_tr:last-child]:border-b"
            )}
            clusters={filteredClusters}
          />
        </TabsContent>
      ))}
    </Tabs>
  )
}

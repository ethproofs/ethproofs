"use client"

import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import type { ProofWithCluster } from "@/lib/types"

import { useRealtimeProofsQuery } from "@/components/realtime/use-realtime-proofs-query"
import EthproofsIcon from "@/components/svgs/ethproofs-icon.svg"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

import { HidePunctuation } from "../StylePunctuation"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Spinner } from "../ui/spinner"

import { ProofItem } from "./proof-item"
import useRealtimeProofs from "./use-realtime-proofs"
import { getProofStatusClasses, ProofStatus } from "./utils"

import { formatNumber } from "@/lib/number"

const STATUS_COLORS: Record<string, string> = {
  queued: "hsl(var(--chart-2))",
  proving: "hsl(var(--chart-9))",
  proved: "hsl(var(--chart-12))",
  downloading: "hsl(var(--chart-15))",
  verifying: "hsl(var(--primary))",
  success: "hsl(var(--primary))",
  failed: "hsl(var(--destructive))",
  error: "hsl(var(--destructive))",
}

const STATUS_LABELS: Record<string, string> = {
  queued: "Queued",
  proving: "Proving",
  proved: "Proved",
  downloading: "Fetching Proof",
  verifying: "Verifying",
  success: "Verified",
  failed: "Failed",
  error: "Error",
}

// Define the order of statuses for consistent display
const STATUS_ORDER = [
  "queued",
  "proving",
  "proved",
  "downloading",
  "verifying",
  "success",
  "failed",
  "error",
]

export function RealtimeProofsDisplayEnhanced() {
  // Use real-time subscription to invalidate cache
  useRealtimeProofs()

  const { data: proofsByBlock, isLoading, error } = useRealtimeProofsQuery()

  // Filter states
  const [deploymentTypeFilter, setDeploymentTypeFilter] = useState<string>("all")
  const [gpuCountFilter, setGpuCountFilter] = useState<string>("all")
  const [teamFilter, setTeamFilter] = useState<string>("all")

  // Get all proofs flattened
  const allProofs = useMemo(() => {
    if (!proofsByBlock) return []
    return Object.values(proofsByBlock).flat() as ProofWithCluster[]
  }, [proofsByBlock])

  // Check if new fields exist in the data (to enable/disable filters)
  const hasDeploymentTypeField = useMemo(() => {
    return allProofs.some((proof) => {
      const cluster = proof.cluster_version?.cluster as Record<string, unknown> | undefined
      const deploymentType = cluster?.deployment_type
      return deploymentType !== undefined && deploymentType !== null
    })
  }, [allProofs])

  const hasGpuCountField = useMemo(() => {
    return allProofs.some((proof) => {
      const cluster = proof.cluster_version?.cluster as Record<string, unknown> | undefined
      const gpuCount = cluster?.gpu_count
      return gpuCount !== undefined && gpuCount !== null
    })
  }, [allProofs])

  // Get unique teams and group them (e.g., all Zisk teams together)
  // This must be before filteredProofsByBlock since it's used there
  const teamGroups = useMemo(() => {
    const teamsMap = new Map<string, string[]>() // team name -> array of team names in group
    
    allProofs.forEach((proof) => {
      const teamName = proof.team?.name
      if (!teamName) return
      
      // Group teams by common prefixes (e.g., "Zisk" groups "Zisk Sevilla", "Zisk Girona")
      const teamLower = teamName.toLowerCase()
      let groupKey = teamName
      
      // Check for common prefixes
      if (teamLower.includes("zisk")) {
        groupKey = "Zisk"
      } else if (teamLower.includes("airbender")) {
        groupKey = "Airbender"
      } else if (teamLower.includes("zkcloud")) {
        groupKey = "ZkCloud"
      } else if (teamLower.includes("openvm")) {
        groupKey = "OpenVM"
      } else if (teamLower.includes("sp1")) {
        groupKey = "SP1"
      } else if (teamLower.includes("pico")) {
        groupKey = "Pico"
      }
      
      if (!teamsMap.has(groupKey)) {
        teamsMap.set(groupKey, [])
      }
      const group = teamsMap.get(groupKey)!
      if (!group.includes(teamName)) {
        group.push(teamName)
      }
    })
    
    // Convert to array of { groupName, teamNames }
    return Array.from(teamsMap.entries())
      .map(([groupName, teamNames]) => ({
        groupName,
        teamNames: teamNames.sort(),
      }))
      .sort((a, b) => a.groupName.localeCompare(b.groupName))
  }, [allProofs])

  // Filter proofs based on selected filters
  const filteredProofsByBlock = useMemo(() => {
    if (!proofsByBlock) return {}
    
    const filtered: Record<number, ProofWithCluster[]> = {}
    
    Object.entries(proofsByBlock).forEach(([blockNum, proofs]) => {
        const filteredProofs = (proofs as ProofWithCluster[]).filter((proof) => {
          const cluster = proof.cluster_version?.cluster
          
          // Filter by team
          if (teamFilter !== "all") {
            const teamName = proof.team?.name
            if (!teamName) {
              // No team info - skip filtering for this proof (show it)
              return true
            }
            
            // Find which group this team belongs to
            const teamGroup = teamGroups.find((group) =>
              group.teamNames.includes(teamName)
            )
            
            if (!teamGroup || teamGroup.groupName !== teamFilter) {
              return false
            }
          }
          
          // Filter by deployment type
          if (deploymentTypeFilter !== "all") {
            // Access deployment_type from cluster object (may not exist if migration not applied)
            const clusterRecord = cluster as Record<string, unknown> | undefined
            const deploymentType = clusterRecord?.deployment_type
            if (deploymentType === undefined || deploymentType === null) {
              // Field doesn't exist - skip filtering for this proof (show it)
              // This allows the UI to work even without the migration
              return true
            }
            if (deploymentType !== deploymentTypeFilter) {
              return false
            }
          }
          
          // Filter by GPU count
          if (gpuCountFilter !== "all") {
            const clusterRecord = cluster as Record<string, unknown> | undefined
            const gpuCount = clusterRecord?.gpu_count
            if (gpuCount === undefined || gpuCount === null) {
              // Field doesn't exist - skip filtering for this proof (show it)
              return true
            }
            const gpuCountNum = typeof gpuCount === "number" ? gpuCount : Number(gpuCount)
            if (isNaN(gpuCountNum)) {
              return true // Skip filtering if not a valid number
            }
            if (gpuCountFilter === "1-2" && (gpuCountNum < 1 || gpuCountNum > 2)) return false
            if (gpuCountFilter === "3-4" && (gpuCountNum < 3 || gpuCountNum > 4)) return false
            if (gpuCountFilter === "5-6" && (gpuCountNum < 5 || gpuCountNum > 6)) return false
            if (gpuCountFilter === "7+" && (gpuCountNum < 7)) return false
          }
          
          return true
        })
      
      if (filteredProofs.length > 0) {
        filtered[Number(blockNum)] = filteredProofs
      }
    })
    
    return filtered
  }, [proofsByBlock, deploymentTypeFilter, gpuCountFilter, teamFilter, teamGroups])


  // Get all block numbers sorted newest first (from filtered proofs)
  const blockNumbers = useMemo(
    () =>
      filteredProofsByBlock
        ? Object.keys(filteredProofsByBlock)
            .map(Number)
            .sort((a, b) => b - a)
        : [],
    [filteredProofsByBlock]
  )

  // Determine which blocks to display
  // Always show the first 3 blocks (newest first)
  const blocksToDisplay: number[] = useMemo(() => {
    return blockNumbers.slice(0, 3)
  }, [blockNumbers])

  // Get total count of filtered proofs in the latest (most recent) block only
  const totalCount = useMemo(() => {
    if (!filteredProofsByBlock || blocksToDisplay.length === 0) return 0
    const latestBlock = blocksToDisplay[0] // First block is the newest (sorted descending)
    const proofs = filteredProofsByBlock[latestBlock] || []
    return proofs.length
  }, [filteredProofsByBlock, blocksToDisplay])

  // Calculate status distribution for each block (using filtered proofs)
  const blockDistributions = useMemo(() => {
    const distributions: Record<number, Array<{ name: string; value: number; color: string }>> = {}
    
    blocksToDisplay.forEach((blockNum) => {
      const proofs = filteredProofsByBlock?.[blockNum]
      if (!proofs) return

      const distribution: Record<string, number> = {}
      
      proofs.forEach((proof: ProofWithCluster) => {
        const status = proof.proof_status as ProofStatus
        distribution[status] = (distribution[status] || 0) + 1
      })

      // Sort by STATUS_ORDER to ensure consistent ordering
      // Only include statuses that have a count > 0
      const sortedEntries = Object.entries(distribution)
        .filter(([_, count]) => count > 0) // Only include statuses with values
        .map(([status, count]) => ({
          status,
          count,
          order: STATUS_ORDER.indexOf(status),
        }))
        .sort((a, b) => {
          // If status is in STATUS_ORDER, use its index, otherwise put it at the end
          const orderA = a.order >= 0 ? a.order : STATUS_ORDER.length
          const orderB = b.order >= 0 ? b.order : STATUS_ORDER.length
          return orderA - orderB
        })

      distributions[blockNum] = sortedEntries.map(({ status, count }) => ({
        name: STATUS_LABELS[status] || status,
        value: count,
        color: STATUS_COLORS[status] || "hsl(var(--muted))",
      }))
    })

    return distributions
  }, [filteredProofsByBlock, blocksToDisplay])


  if (isLoading) {
    return (
      <div className="mt-4 flex items-center justify-center gap-2">
        <Spinner className="text-muted-foreground" />
        <p className="text-muted-foreground">loading proofs...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">
          error loading proofs: {error.message}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <EthproofsIcon className="h-12 w-12" />
          <div>
            <h2 className="text-xl font-semibold">realtime proofs</h2>
            <p className="text-3xl font-bold text-primary">
              <HidePunctuation>{formatNumber(totalCount)}</HidePunctuation>
            </p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-4">
          <Select 
            value={teamFilter} 
            onValueChange={setTeamFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teamGroups.map((group) => (
                <SelectItem key={group.groupName} value={group.groupName}>
                  {group.groupName} {group.teamNames.length > 1 ? `(${group.teamNames.length})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={deploymentTypeFilter} 
            onValueChange={setDeploymentTypeFilter}
            disabled={!hasDeploymentTypeField}
          >
            <SelectTrigger className="w-[180px]" disabled={!hasDeploymentTypeField}>
              <SelectValue placeholder={hasDeploymentTypeField ? "Deployment Type" : "Deployment Type (N/A)"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="cloud">Cloud</SelectItem>
              <SelectItem value="on-premise">On-Premise</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={gpuCountFilter} 
            onValueChange={setGpuCountFilter}
            disabled={!hasGpuCountField}
          >
            <SelectTrigger className="w-[180px]" disabled={!hasGpuCountField}>
              <SelectValue placeholder={hasGpuCountField ? "GPU Count" : "GPU Count (N/A)"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All GPUs</SelectItem>
              <SelectItem value="1-2">1-2 GPUs</SelectItem>
              <SelectItem value="3-4">3-4 GPUs</SelectItem>
              <SelectItem value="5-6">5-6 GPUs</SelectItem>
              <SelectItem value="7+">7+ GPUs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Proofs by block or empty message */}
      {blocksToDisplay.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-muted-foreground">
              No proofs found
            </p>
            <p className="text-sm text-muted-foreground">
              {teamFilter !== "all" || deploymentTypeFilter !== "all" || gpuCountFilter !== "all"
                ? "Try adjusting your filters to see more results"
                : "No active proofs available"}
            </p>
          </div>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {blocksToDisplay.map((blockNum) => {
            const proofs = filteredProofsByBlock?.[blockNum]
            if (!proofs) return null

          const blockStatusDistribution = blockDistributions[blockNum] || []
          const blockTotalCount = proofs.length

          return (
            <motion.div
              key={blockNum}
              layout
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{ position: "relative" }}
            >
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-normal">
                      Block <HidePunctuation>{formatNumber(blockNum)}</HidePunctuation>
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {blockTotalCount} proof{blockTotalCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex gap-6 overflow-hidden">
                  {/* Proofs list on the left */}
                  <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                    {proofs.map((proof: ProofWithCluster) => (
                      <ProofItem key={proof.proof_id} proof={proof} />
                    ))}
                  </div>

                    {/* Block-specific pie chart on the right */}
                    {blockStatusDistribution.length > 0 && (
                      <div className="flex-shrink-0 w-64 space-y-3 overflow-y-auto">
                        <ChartContainer
                          key={`block-chart-${blockNum}-${blockTotalCount}-${JSON.stringify(blockStatusDistribution.map(s => s.value).sort().join('-'))}`}
                          config={blockStatusDistribution.reduce(
                            (acc, item) => ({
                              ...acc,
                              [item.name]: {
                                label: item.name,
                                color: item.color,
                              },
                            }),
                            {} as Record<string, { label: string; color: string }>
                          )}
                          className="h-[180px] w-full"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={blockStatusDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ value, cx, cy, midAngle, innerRadius, outerRadius }) => {
                                  const RADIAN = Math.PI / 180
                                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
                                  const x = cx + radius * Math.cos(-midAngle * RADIAN)
                                  const y = cy + radius * Math.sin(-midAngle * RADIAN)
                                  
                                  return (
                                    <text
                                      x={x}
                                      y={y}
                                      fill="hsl(var(--foreground))"
                                      textAnchor="middle"
                                      dominantBaseline="central"
                                      fontSize={12}
                                      fontWeight="bold"
                                    >
                                      {value}
                                    </text>
                                  )
                                }}
                                outerRadius={60}
                                innerRadius={20}
                                fill="#8884d8"
                                dataKey="value"
                                animationDuration={0}
                                isAnimationActive={false}
                              >
                                {blockStatusDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0]
                                    return (
                                      <div className="rounded-lg border bg-background p-3 shadow-sm">
                                        <div className="grid gap-2">
                                          <div className="flex items-center justify-between gap-4">
                                            <span className="text-sm font-medium">
                                              {data.name}
                                            </span>
                                            <span className="text-sm font-bold">
                                              {data.value}
                                            </span>
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            {(((data.value as number) / blockTotalCount) * 100).toFixed(1)}% of block
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  }
                                  return null
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                        
                        {/* Legend for block chart - always show all statuses in order */}
                        <div className="grid grid-cols-1 gap-2">
                          {STATUS_ORDER.map((status) => {
                            const item = blockStatusDistribution.find(
                              (d) => d.name === STATUS_LABELS[status]
                            )
                            const value = item?.value || 0
                            const color = STATUS_COLORS[status] || "hsl(var(--muted))"
                            
                            return (
                              <div
                                key={status}
                                className="flex items-center justify-between rounded-md border p-2 text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: color }}
                                  />
                                  <span className="font-medium">{STATUS_LABELS[status]}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="font-bold">{value}</span>
                                  {value > 0 && (
                                    <span className="text-muted-foreground text-[10px]">
                                      ({((value / blockTotalCount) * 100).toFixed(0)}%)
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
        </AnimatePresence>
      )}
    </div>
  )
}


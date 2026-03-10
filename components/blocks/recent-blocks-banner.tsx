"use client"

import { useRef } from "react"
import { AnimatePresence, LayoutGroup, motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"

import {
  RTP_PARALYZER_CUTOFF_MINUTES,
  RTP_PERFORMANCE_TIME_THRESHOLD_MS,
} from "@/lib/constants"

import type { RecentBlocksSummary } from "@/lib/api/blocks-metrics"
import { formatNumber } from "@/lib/number"
import { prettyMs } from "@/lib/time"

const PARALYZER_CUTOFF_MS = RTP_PARALYZER_CUTOFF_MINUTES * 60 * 1000

const STATUS_CONFIG = {
  success: {
    label: "success",
    className: "text-primary",
    bgClassName: "bg-primary/20",
    borderClassName: "border-primary",
  },
  queued: {
    label: "queued",
    className: "text-chart-2",
    bgClassName: "bg-chart-2/20",
    borderClassName: "border-chart-2",
  },
  proving: {
    label: "proving",
    className: "text-chart-9",
    bgClassName: "bg-chart-9/20",
    borderClassName: "border-chart-9",
  },
  stunner: {
    label: "stunner",
    className: "text-warning",
    bgClassName: "bg-warning/20",
    borderClassName: "border-warning",
  },
  paralyzer: {
    label: "paralyzer",
    className: "text-destructive",
    bgClassName: "bg-destructive/20",
    borderClassName: "border-destructive",
  },
} as const

function classifyProvingTime(
  time: number | null
): "success" | "stunner" | "paralyzer" {
  if (time === null) return "paralyzer"
  if (time < RTP_PERFORMANCE_TIME_THRESHOLD_MS) return "success"
  if (time < PARALYZER_CUTOFF_MS) return "stunner"
  return "paralyzer"
}

export function RecentBlocksBanner() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data, isLoading } = useQuery<RecentBlocksSummary>({
    queryKey: ["blocks", "recent-summary"],
    queryFn: async () => {
      const response = await fetch("/api/blocks/metrics?type=recent")
      return response.json()
    },
    staleTime: Infinity,
  })

  function scrollBy(direction: "left" | "right") {
    if (!scrollRef.current) return
    const amount = direction === "left" ? -300 : 300
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" })
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
          loading recent blocks...
        </div>
      </div>
    )
  }

  if (!data || data.blocks.length === 0) return null

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">recent blocks</span>
          <div className="flex items-center gap-1">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            <span className="text-xs text-primary">live</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-6 text-xs">
            <div className="flex flex-col items-center">
              <span className="text-muted-foreground">success rate</span>
              <span className="text-lg font-semibold">
                {Math.round(data.successRate)}%
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-muted-foreground">avg time</span>
              <span className="text-lg font-semibold">
                {data.avgProvingTime !== null
                  ? prettyMs(data.avgProvingTime)
                  : "-"}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-muted-foreground">blocks</span>
              <span className="text-lg font-semibold">{data.totalBlocks}</span>
            </div>
          </div>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => scrollBy("left")}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => scrollBy("right")}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto px-4 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <LayoutGroup>
          <AnimatePresence initial={false}>
            {data.blocks.map((block) => {
              const config = STATUS_CONFIG[block.status]
              const timeCategory =
                block.status === "proving"
                  ? "proving"
                  : classifyProvingTime(block.bestProvingTime)

              return (
                <motion.div
                  key={block.blockNumber}
                  layout
                  initial={{ x: -160, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 160, opacity: 0 }}
                  transition={{
                    layout: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.3 },
                    x: { type: "spring", stiffness: 300, damping: 30 },
                  }}
                  className="flex shrink-0 flex-col gap-1.5 rounded-md border bg-background px-3 py-2"
                  style={{ minWidth: 140 }}
                >
                  <span className="text-xs font-semibold tracking-wide">
                    #{formatNumber(block.blockNumber)}
                  </span>

                  <span
                    className={cn(
                      "inline-flex w-fit rounded-sm px-2 py-0.5 text-xs font-semibold",
                      config.bgClassName,
                      config.className
                    )}
                  >
                    {config.label}
                  </span>

                  <span
                    className={cn(
                      "text-base font-bold tabular-nums",
                      timeCategory === "stunner" && "text-warning",
                      timeCategory === "paralyzer" && "text-destructive"
                    )}
                  >
                    {block.bestProvingTime !== null
                      ? prettyMs(block.bestProvingTime)
                      : "—"}
                  </span>

                  <span className="text-[10px] text-muted-foreground">
                    {block.gasUsed !== null
                      ? `${(block.gasUsed / 1e6).toFixed(1)}M gas`
                      : ""}
                  </span>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </div>
  )
}

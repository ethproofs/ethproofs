"use client"

import { useState } from "react"
import { Check } from "lucide-react"

import { Card } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { cn } from "@/lib/utils"

type PhaseStatus = "complete" | "current" | "future"

interface Milestone {
  id: string
  name: string
  status: PhaseStatus
}

interface Phase {
  id: string
  label: string
  name: string
  status: PhaseStatus
  description: string
  timeline: string
  achievements?: string[]
  milestones?: Milestone[]
  currentMilestone?: string
  requirements?: string[]
}

const phases: Phase[] = [
  {
    id: "0.1",
    label: "PHASE 0.1",
    name: "performance sprint",
    status: "complete",
    description: "achieved real-time proving",
    timeline: "2024 - 2025",
    achievements: [
      "sub-10s proving",
      "RTP cohort established",
      "multiple zkVMs integrated",
    ],
  },
  {
    id: "0.2",
    label: "PHASE 0.2",
    name: "security sprint",
    status: "current",
    description: "security milestones",
    timeline: "2025 - 2026",
    milestones: [
      { id: "M1", name: "soundcalc integration", status: "current" },
      { id: "M2", name: "100-bit provable / 600 KiB", status: "future" },
      { id: "M3", name: "128-bit provable / 300 KiB", status: "future" },
    ],
    currentMilestone: "M2",
  },
  {
    id: "1",
    label: "PHASE 1",
    name: "delayed proving",
    status: "future",
    description: "proofs accepted with delay",
    timeline: "2026+",
    requirements: [
      "security sprint complete",
      "client integration",
      "economic model finalized",
    ],
  },
  {
    id: "2",
    label: "PHASE 2",
    name: "mandatory proving",
    status: "future",
    description: "proofs required for validity",
    timeline: "TBD",
    requirements: [
      "delayed proving stable",
      "network-wide adoption",
      "fallback mechanisms",
    ],
  },
  {
    id: "3",
    label: "PHASE 3",
    name: "enshrined proofs",
    status: "future",
    description: "protocol-native proving",
    timeline: "TBD",
    requirements: [
      "mandatory proving mature",
      "protocol upgrade",
      "full decentralization",
    ],
  },
]

const progressPercent = 26

function PhaseNode({ phase, isHovered }: { phase: Phase; isHovered: boolean }) {
  const isComplete = phase.status === "complete"
  const isCurrent = phase.status === "current"

  return (
    <div
      className={cn(
        "size-3 rounded-full border-2 transition-all duration-200 lg:size-4",
        isHovered && "scale-125",
        isComplete && "border-info bg-info",
        isCurrent &&
          "border-primary bg-primary shadow-[0_0_12px_hsla(var(--primary)/0.6)]",
        phase.status === "future" && "border-muted-foreground bg-transparent"
      )}
    />
  )
}

function PhaseTooltipContent({ phase }: { phase: Phase }) {
  return (
    <div className="w-64 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold">{phase.name}</span>
        <span className="text-xs text-muted-foreground">{phase.timeline}</span>
      </div>
      <p className="text-sm text-muted-foreground">{phase.description}</p>

      {phase.achievements && (
        <div className="space-y-1">
          {phase.achievements.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <Check className="size-3 text-info" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}

      {phase.milestones && (
        <div className="space-y-2">
          {phase.milestones.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "size-2 rounded-full",
                    m.status === "complete" && "bg-primary",
                    m.status === "current" && "bg-primary",
                    m.status === "future" && "bg-muted"
                  )}
                />
                <span>
                  {m.id}: {m.name}
                </span>
              </div>
              <span
                className={cn(
                  "text-xs",
                  m.status === "future"
                    ? "text-muted-foreground"
                    : "text-primary"
                )}
              >
                {m.status === "complete"
                  ? "✓"
                  : m.status === "current"
                    ? "in progress"
                    : "upcoming"}
              </span>
            </div>
          ))}
        </div>
      )}

      {phase.requirements && (
        <div className="space-y-1">
          {phase.requirements.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div className="size-1.5 rounded-full bg-muted-foreground" />
              <span className="text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PhaseMarker({ phase }: { phase: Phase }) {
  const [isHovered, setIsHovered] = useState(false)
  const isCurrent = phase.status === "current"
  const isComplete = phase.status === "complete"

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div
            className="relative z-[1] flex flex-1 flex-col items-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <span
              className={cn(
                "mb-1.5 font-mono text-xxs tracking-wider transition-colors duration-200 lg:mb-2 lg:text-xs",
                isHovered
                  ? isComplete
                    ? "text-info"
                    : isCurrent
                      ? "text-primary"
                      : "text-muted-foreground"
                  : "text-muted-foreground"
              )}
            >
              {phase.label}
            </span>

            <PhaseNode phase={phase} isHovered={isHovered} />

            {/* {hasMilestones ? (
              <div className="relative w-full">
                <div className="mb-1 flex justify-center">
                  <PhaseNode phase={phase} isHovered={isHovered} />
                </div>
                <MilestoneTrack milestones={phase.milestones!} />
              </div>
            ) : (
              <PhaseNode phase={phase} isHovered={isHovered} />
            )} */}

            <p
              className={cn(
                "mt-2 text-center text-xxs font-medium transition-all duration-200 lg:mt-4 lg:text-sm",
                // hasMilestones && "mt-4 lg:mt-6",
                phase.status === "future" && "text-muted-foreground",
                isComplete && "text-info",
                isCurrent && "text-xs text-primary"
              )}
            >
              {phase.name}
            </p>

            <div className="mt-1 flex h-4 items-center gap-1 lg:mt-2 lg:h-5 lg:gap-1.5">
              {isComplete && (
                <>
                  <Check className="size-3 text-info lg:size-3.5" />
                  <span className="text-xxs text-info lg:text-xs">
                    complete
                  </span>
                </>
              )}
              {isCurrent && (
                <>
                  <div className="relative">
                    <div className="size-1.5 rounded-full bg-primary lg:size-2" />
                    <div className="absolute inset-0 size-1.5 animate-ping rounded-full bg-primary opacity-75 lg:size-2" />
                  </div>
                  <span className="text-xxs font-medium text-primary lg:text-xs">
                    current
                  </span>
                </>
              )}
              {phase.status === "future" && (
                <>
                  <div className="size-1.5 rounded-full bg-muted-foreground lg:size-2" />
                  <span className="text-xxs text-muted-foreground lg:text-xs">
                    future
                  </span>
                </>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="p-4">
          <PhaseTooltipContent phase={phase} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function StatusLegend() {
  return (
    <div className="flex items-center gap-2 text-xxs lg:gap-4 lg:text-sm">
      <div className="flex items-center gap-1 lg:gap-1.5">
        <div className="size-2 rounded-full bg-info lg:size-2.5" />
        <span className="text-muted-foreground">complete</span>
      </div>
      <div className="flex items-center gap-1 lg:gap-1.5">
        <div className="size-2 rounded-full bg-primary lg:size-2.5" />
        <span className="text-muted-foreground">current</span>
      </div>
      <div className="flex items-center gap-1 lg:gap-1.5">
        <div className="size-2 rounded-full bg-muted-foreground lg:size-2.5" />
        <span className="text-muted-foreground">future</span>
      </div>
    </div>
  )
}

function CurrentStatusBar() {
  const currentPhase = phases.find((p) => p.status === "current")
  const currentMilestone = currentPhase?.milestones?.find(
    (m) => m.status === "current"
  )

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs lg:gap-x-3 lg:gap-y-2 lg:text-sm">
      <div className="flex items-center gap-1 lg:gap-2">
        <span className="text-muted-foreground">currently in</span>
      </div>
      <span className="font-semibold text-primary">security sprint</span>
      {currentMilestone && (
        <>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">working on</span>
          <span className="font-medium text-primary">
            {currentMilestone.id}: {currentMilestone.name}
          </span>
        </>
      )}
    </div>
  )
}

function MobileRoadmapBanner() {
  const currentPhase = phases.find((p) => p.status === "current")
  const currentMilestone = currentPhase?.milestones?.find(
    (m) => m.status === "current"
  )
  const currentIndex = phases.findIndex((p) => p.status === "current")
  const completedCount = phases.filter((p) => p.status === "complete").length

  return (
    <Card className="w-full overflow-hidden lg:hidden">
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="size-2 rounded-full bg-primary" />
              <div className="absolute inset-0 size-2 animate-ping rounded-full bg-primary opacity-75" />
            </div>
            <span className="text-xs text-muted-foreground">
              phase {currentIndex + 1} of {phases.length}
            </span>
          </div>
          <StatusLegend />
        </div>

        <div className="space-y-2">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${((completedCount + 0.5) / phases.length) * 100}%`,
                background:
                  "linear-gradient(90deg, hsla(var(--info)) 0%, hsla(var(--info)) 80%, hsla(var(--primary)) 100%)",
              }}
            />
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">
                {currentPhase?.name}
              </p>
              {currentMilestone && (
                <p className="text-xs text-muted-foreground">
                  working on {currentMilestone.id}: {currentMilestone.name}
                </p>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {currentPhase?.timeline}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

function DesktopRoadmapBanner() {
  return (
    <Card className="hidden w-full overflow-hidden lg:block">
      <div className="p-6">
        <div className="relative">
          <div className="absolute left-0 right-0 top-[32px] h-1 rounded-full bg-muted" />
          <div
            className="absolute left-0 top-[32px] h-1 rounded-full transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
              background:
                "linear-gradient(90deg, hsla(var(--info)) 0%, hsla(var(--info)) 75%, hsla(var(--primary)) 100%)",
            }}
          />
          <div className="relative flex items-start">
            {phases.map((phase) => (
              <PhaseMarker key={phase.id} phase={phase} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t bg-muted/30 px-6 py-4">
        <CurrentStatusBar />
        <StatusLegend />
      </div>
    </Card>
  )
}

export function RoadmapBanner() {
  return (
    <>
      <MobileRoadmapBanner />
      <DesktopRoadmapBanner />
    </>
  )
}

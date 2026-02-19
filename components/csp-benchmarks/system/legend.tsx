import { Check, CircleAlert, Minus, X } from "lucide-react"

import { cn } from "@/lib/utils"

import type { CspSeverityLevel, CspSlices } from "./slices"

const severityColors: Record<CspSeverityLevel, string> = {
  green: "hsl(var(--level-best))",
  yellow: "hsl(var(--level-middle))",
  red: "hsl(var(--level-worst))",
  none: "hsl(var(--muted-foreground))",
}

const severityIcons: Record<CspSeverityLevel, React.ComponentType<{ className?: string }>> = {
  green: Check,
  yellow: CircleAlert,
  red: X,
  none: Minus,
}

interface SystemLegendProps {
  slices: CspSlices
  className?: string
}

export function SystemLegend({
  slices,
  className,
}: SystemLegendProps) {
  return (
    <div className={cn("flex flex-col gap-3 text-sm", className)}>
      {slices.map((slice) => {
        const Icon = severityIcons[slice.level]
        return (
          <div key={slice.label} className="flex items-center gap-2">
            <span
              className="shrink-0"
              style={{ color: severityColors[slice.level] }}
              aria-hidden="true"
            >
              <Icon className="size-4" />
            </span>
            <span className="flex-1">
              {slice.label}
            </span>
            <span
              className="text-right font-medium"
              style={{ color: severityColors[slice.level] }}
            >
              {slice.statusLabel}
            </span>
          </div>
        )
      })}
    </div>
  )
}

import type { ZkvmSummaryData } from "@/lib/types"

import { MetricCard } from "@/components/metrics/metric-card"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface MilestoneValueProps {
  label: string
  value: number
}

interface MilestoneCardProps {
  isCurrent?: boolean
  values: MilestoneValueProps[]
  milestone: string
}

function MilestoneCard({ isCurrent, values, milestone }: MilestoneCardProps) {
  return (
    <Card>
      <CardContent className="flex gap-6 pt-6">
        {values.map((v) => (
          <div key={v.label} className="flex flex-col gap-2">
            <span className="text-xs text-muted-foreground">{v.label}</span>
            <span className="text-2xl font-semibold">
              {String(v.value).padStart(2, "0")}
            </span>
          </div>
        ))}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          {isCurrent ? (
            <div className="size-2 rounded-full bg-primary" />
          ) : (
            <div className="size-2 rounded-full bg-muted-foreground" />
          )}
          <span>{milestone}</span>
        </div>
      </CardFooter>
    </Card>
  )
}

interface ZkvmSummaryCardsProps {
  data: ZkvmSummaryData
}

export function ZkvmSummaryCards({ data }: ZkvmSummaryCardsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="total zkVMs"
          value={String(data.totalZkvms).padStart(2, "0")}
          isIncreasePositive
        />
        <MetricCard
          label="zkVMs w/ PQ cryptography"
          value={String(data.pqCryptographyCount).padStart(2, "0")}
          isIncreasePositive
        />
        <MetricCard
          label="zkVMs w/ RTP-eligible prover"
          value={String(data.rtpEligibleProverCount).padStart(2, "0")}
          isIncreasePositive
        />
        <MetricCard
          label="ISAs represented"
          value={String(data.isaCount).padStart(2, "0")}
          isIncreasePositive
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MilestoneCard
          isCurrent
          values={[
            { label: "integrated into soundcalc", value: data.soundcalcCount },
          ]}
          milestone="security sprint: milestone 1 (M1)"
        />
        <MilestoneCard
          values={[
            {
              label: "\u2265100-bit security",
              value: data.security100BitCount,
            },
            {
              label: "\u2264 600 KiB proof size",
              value: data.proofSize600KibCount,
            },
          ]}
          milestone="security sprint: milestone 2 (M2)"
        />
        <MilestoneCard
          values={[
            {
              label: "\u2265128-bit security",
              value: data.security128BitCount,
            },
            {
              label: "\u2264 300 KiB proof size",
              value: data.proofSize300KibCount,
            },
          ]}
          milestone="security sprint: milestone 3 (M3)"
        />
      </div>
    </div>
  )
}

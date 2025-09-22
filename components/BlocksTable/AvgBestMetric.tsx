import type { Stats } from "@/lib/types"

import { MetricInfo } from "@/components/ui/metric"

import { AVERAGE_LABEL } from "@/lib/constants"

import ClusterDetails from "./ClusterDetails"
import TeamName from "./TeamName"
import { Award } from "lucide-react"

const AvgBestMetric = ({ stats }: { stats: Stats }) => (
  <>
    <span className="flex gap-4 whitespace-nowrap">
      <span>
        {stats.bestFormatted}
        <span className="block whitespace-nowrap text-sm text-body-secondary">
          {AVERAGE_LABEL} {stats.avgFormatted}
        </span>
      </span>

      <MetricInfo
        trigger={
          <Award className="size-4 text-primary hover:text-primary-light" />
        }
      >
        <TeamName proof={stats.bestProof} />
        <ClusterDetails proof={stats.bestProof} />
      </MetricInfo>
    </span>
  </>
)

export default AvgBestMetric

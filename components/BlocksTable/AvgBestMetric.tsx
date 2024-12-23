import type { Stats } from "@/lib/types"

import Award from "@/components/svgs/award.svg"
import { MetricInfo } from "@/components/ui/metric"

import { AVERAGE_LABEL } from "@/lib/constants"

import ClusterDetails from "./ClusterDetails"
import TeamName from "./TeamName"

const AvgBestMetric = ({ stats }: { stats: Stats }) => (
  <>
    <span className="align-center flex justify-center whitespace-nowrap">
      <MetricInfo
        trigger={
          <div className="flex items-center gap-1">
            {stats.bestFormatted}
            <Award className="text-primary hover:text-primary-light" />
          </div>
        }
      >
        <TeamName proof={stats.bestProof} />
        <ClusterDetails proof={stats.bestProof} />
      </MetricInfo>
    </span>
    <span className="block whitespace-nowrap text-sm text-body-secondary">
      {AVERAGE_LABEL} {stats.avgFormatted}
    </span>
  </>
)

export default AvgBestMetric

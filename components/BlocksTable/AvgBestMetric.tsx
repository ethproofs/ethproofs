import type { Stats } from "@/lib/types"

import Award from "@/components/svgs/award.svg"
import { MetricInfo } from "@/components/ui/metric"

import { AVERAGE_LABEL } from "@/lib/constants"

import ClusterDetails from "./ClusterDetails"
import TeamName from "./TeamName"

const AvgBestMetric = ({ stats }: { stats: Stats }) => (
  <>
    <span className="align-center flex justify-center gap-2 whitespace-nowrap">
      <span className="text-end">
        {stats.bestFormatted}
        <span className="block whitespace-nowrap text-sm text-body-secondary">
          {AVERAGE_LABEL} {stats.avgFormatted}
        </span>
      </span>

      <MetricInfo
        trigger={
          <div className="grid place-items-center rounded-full border border-primary-border p-1.5">
            <Award className="text-primary hover:text-primary-light" />
          </div>
        }
      >
        <TeamName proof={stats.bestProof} />
        <ClusterDetails proof={stats.bestProof} />
      </MetricInfo>
    </span>
  </>
)

export default AvgBestMetric

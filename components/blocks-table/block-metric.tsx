import { Award } from "lucide-react"

import type { Stats } from "@/lib/types"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { AVERAGE_LABEL } from "@/lib/constants"

const BlockMetric = ({ stats }: { stats: Stats }) => (
  <div className="flex w-[120px] justify-between gap-4 whitespace-nowrap">
    <div>
      <span>{stats.bestFormatted}</span>
      <span className="block text-xs text-muted-foreground">
        {AVERAGE_LABEL} {stats.avgFormatted}
      </span>
    </div>
    <Tooltip>
      <TooltipTrigger className="hover:opacity-80">
        <Award className="size-4 text-primary hover:text-primary-light" />
      </TooltipTrigger>
      <TooltipContent className="max-w-80 sm:max-w-96">
        <div className="space-y-2 text-start">
          {stats.bestProof.team && (
            <span className="text-xs text-primary">
              {stats.bestProof.team.name}
            </span>
          )}{" "}
          <span className="text-xs text-muted-foreground">|</span>{" "}
          <span className="text-xs">
            {stats.bestProof.cluster_version.cluster.name}
          </span>
        </div>
      </TooltipContent>
    </Tooltip>
  </div>
)

export default BlockMetric

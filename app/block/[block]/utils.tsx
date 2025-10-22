import type { Stats } from "@/lib/types"

import { metrics } from "@/components/Metrics"
import Null from "@/components/Null"
import * as Info from "@/components/ui/info"
import { TooltipContentHeader } from "@/components/ui/tooltip"

import { AVERAGE_LABEL } from "@/lib/constants"

type Props = {
  costPerProofStats: Stats | null
  costPerMgasStats: Stats | null
  provingTimeStats: Stats | null
  totalTTPStats: Stats | null
}

export const getAvailabilityMetrics = (stats: Props) => [
  {
    key: "fastest-proving-time",
    label: (
      <>
        Fastest <metrics.provingTime.Label />
      </>
    ),
    // TODO: Include team information with fastest proving time
    description: (
      <>
        <TooltipContentHeader>
          fastest <metrics.provingTime.Label />
        </TooltipContentHeader>
        <metrics.provingTime.Details />
        <Info.Description>
          Fastest reported proving time for any of the proofs submitted for this
          block.
        </Info.Description>
      </>
    ),
    value: stats.provingTimeStats?.bestFormatted ?? <Null />,
  },
  {
    key: "avg-proving-time",
    label: (
      <>
        {AVERAGE_LABEL} <metrics.provingTime.Label />
      </>
    ),
    description: (
      <>
        <TooltipContentHeader>
          average <metrics.provingTime.Label />
        </TooltipContentHeader>
        <metrics.provingTime.Details average />
      </>
    ),
    value: stats.provingTimeStats?.avgFormatted ?? <Null />,
  },
  {
    key: "fastest-total-ttp",
    label: (
      <>
        Fastest <metrics.totalTTP.Label />
      </>
    ),
    // TODO: Include team information with fastest proving time
    description: (
      <>
        <TooltipContentHeader>
          fastest <metrics.totalTTP.Label />
        </TooltipContentHeader>
        <metrics.totalTTP.Details />
        <Info.Description>
          Total time delay between execution block timestamp and completion and
          publishing of proof.
        </Info.Description>
        <Info.Description>
          Fastest time to proof for any of the proofs submitted for this block.
        </Info.Description>
      </>
    ),
    value: stats.totalTTPStats?.bestFormatted ?? <Null />,
  },
  {
    key: "avg-total-ttp",
    label: (
      <>
        {AVERAGE_LABEL} <metrics.totalTTP.Label />
      </>
    ),
    description: (
      <>
        <TooltipContentHeader>
          average <metrics.totalTTP.Label />
        </TooltipContentHeader>
        <metrics.totalTTP.Details average />
        <Info.Description>
          Total time delay between execution block timestamp and completion and
          publishing of proof.
        </Info.Description>
        <Info.Description>
          Average time to proof for all of the proofs submitted for this block.
        </Info.Description>
      </>
    ),
    value: stats.totalTTPStats?.avgFormatted ?? <Null />,
  },
]

export const getBlockFeeMetrics = (stats: Props) => [
  {
    key: "cheapest-cost-per-proof",
    label: (
      <>
        cheapest <metrics.costPerProof.Label />
      </>
    ),
    description: (
      <>
        <TooltipContentHeader>
          cheapest <metrics.costPerProof.Label />
        </TooltipContentHeader>
        <metrics.costPerProof.Details />
      </>
    ),
    value: stats.costPerProofStats?.bestFormatted ?? <Null />,
  },
  {
    key: "avg-cost-per-proof",
    label: (
      <>
        {AVERAGE_LABEL} <metrics.costPerProof.Label />
      </>
    ),
    description: (
      <>
        <TooltipContentHeader>
          {AVERAGE_LABEL} <metrics.costPerProof.Label />
        </TooltipContentHeader>
        <metrics.costPerProof.Details average />
      </>
    ),
    value: stats.costPerProofStats?.avgFormatted ?? <Null />,
  },
  {
    key: "cheapest-cost-per-mgas",
    label: (
      <div>
        cheapest <metrics.costPerMgas.Label />
      </div>
    ),
    description: (
      <>
        <TooltipContentHeader>
          cheapest <metrics.costPerMgas.Label />
        </TooltipContentHeader>
        <metrics.costPerMgas.Details />
      </>
    ),
    value: stats.costPerMgasStats?.bestFormatted ?? <Null />,
  },
  {
    key: "avg-cost-per-mgas",
    label: (
      <div>
        {AVERAGE_LABEL} <metrics.costPerMgas.Label />
      </div>
    ),
    description: (
      <>
        <TooltipContentHeader>
          {AVERAGE_LABEL} <metrics.costPerMgas.Label />
        </TooltipContentHeader>
        <metrics.costPerMgas.Details />
      </>
    ),
    value: stats.costPerMgasStats?.avgFormatted ?? <Null />,
  },
]

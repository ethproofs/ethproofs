import * as Info from "@/components/ui/info"

import { computed, primitives } from "./Definitions"

type MetricDetails = {
  Label: () => React.ReactNode
  Details: (props: { average?: boolean }) => React.ReactNode
}

const METRICS = {
  blockNumber: "block",
  cluster: "cluster",
  costPerMgas: (
    <>
      cost per <span className="uppercase">m</span>gas
    </>
  ),
  costPerProof: "cost per proof",
  gasUsed: "gas used",
  provingTime: "proving time",
  totalTTP: "total time to proof",
} as const

type Metric = keyof typeof METRICS

const metrics: Record<Metric, MetricDetails> = {
  blockNumber: {
    Label: () => METRICS.blockNumber,
    Details: () => (
      <>
        <Info.Derivation>
          <primitives.blockNumber.Term />
        </Info.Derivation>

        <primitives.blockNumber.Definition />

        <Info.Description>Block height number</Info.Description>
      </>
    ),
  },
  cluster: {
    Label: () => METRICS.cluster,
    Details: () => (
      <>
        <Info.Derivation>
          <primitives.cluster.Term />
        </Info.Derivation>

        <primitives.cluster.Definition />

        <Info.Description>
          A cluster is composed of one or more sets of hardware working together
          to generate a proof. For cost comparisons, clusters are broken down
          using closest-equivalent AWS hardware instances, each with it&apos;s
          own pricing as reported by AWS.
        </Info.Description>
      </>
    ),
  },
  costPerMgas: {
    Label: () => METRICS.costPerMgas,
    Details: () => (
      <>
        <Info.Derivation>
          <computed.provingCosts.Term /> / <computed.mgas.Term />
        </Info.Derivation>

        <computed.provingCosts.Definition />
        <computed.mgas.Definition />

        <Info.Description>
          Proving costs in USD per million gas units proven
        </Info.Description>
        <Info.Description>
          Normalized USD cost per gas unit to allow comparison amongst proofs of
          different sized blocks. More gas consumption in a block means more
          computation to prove.
        </Info.Description>
      </>
    ),
  },
  costPerProof: {
    Label: () => METRICS.costPerProof,
    Details: () => (
      <>
        <Info.Derivation>
          <computed.provingCosts.Term />
        </Info.Derivation>

        <computed.provingCosts.Definition />

        <Info.Description>
          Proving costs in USD to prove execution of entire block
        </Info.Description>
      </>
    ),
  },
  gasUsed: {
    Label: () => METRICS.gasUsed,
    Details: () => (
      <>
        <Info.Derivation>
          <primitives.gasUsed.Term />
        </Info.Derivation>

        <primitives.gasUsed.Definition />

        <Info.Description>
          Total gas units executed within block
        </Info.Description>
        <Info.Description>
          Proportional to the amount of computational effort a block outputs.
          Less gas = less computationally intense = easier to prove.
        </Info.Description>
      </>
    ),
  },
  provingTime: {
    Label: () => METRICS.provingTime,
    Details: ({ average }) => (
      <>
        <Info.Derivation>
          {average ? "∑(" : ""}
          <primitives.provingTime.Term />
          {average ? ") / number of completed proofs for block" : ""}
        </Info.Derivation>

        <primitives.provingTime.Definition />

        <Info.Description>
          Time spent generating proof of execution
        </Info.Description>

        {average ? (
          <Info.Description>
            Average reported proving time for all completed proofs submitted for
            this block
          </Info.Description>
        ) : null}
      </>
    ),
  },
  totalTTP: {
    Label: () => METRICS.totalTTP,
    Details: ({ average }) => (
      <>
        <Info.Derivation>
          {average ? "∑(" : ""}
          <primitives.proofSubmissionTime.Term /> -{" "}
          <primitives.timestamp.Term />
          {average ? ") / number of completed proofs for block" : ""}
        </Info.Derivation>

        <primitives.proofSubmissionTime.Definition />
        <primitives.timestamp.Definition />
      </>
    ),
  },
}

export { metrics }

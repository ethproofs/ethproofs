import * as Info from "@/components/ui/info"

import { SITE_NAME } from "@/lib/constants"

type DefinitionDetails = {
  Term: () => React.ReactNode
  Definition: () => React.ReactNode
}

const PRIMITIVES = {
  hourlyPricePerInstance: "hourly price per instance",
  instanceCount: "instances per cluster",
  provingTime: "proving time",
  gasUsed: "gas used",
  blockNumber: "block number",
  proofSubmissionTime: "proof submission time",
  timestamp: "timestamp",
  cluster: "cluster",
} as const

type Primitive = keyof typeof PRIMITIVES

const primitives: Record<Primitive, DefinitionDetails> = {
  hourlyPricePerInstance: {
    Term: () => (
      <Info.Term type="internal">{PRIMITIVES.hourlyPricePerInstance}</Info.Term>
    ),
    Definition: () => (
      <p>
        <Info.Term type="internal">
          {PRIMITIVES.hourlyPricePerInstance}
        </Info.Term>{" "}
        is the per-hour USD rate charged by AWS for one instance of the cluster
        of hardware most-equivalent to that being used by the prover
      </p>
    ),
  },
  instanceCount: {
    Term: () => (
      <Info.Term type="internal">{PRIMITIVES.instanceCount}</Info.Term>
    ),
    Definition: () => (
      <p>
        <Info.Term type="internal">{PRIMITIVES.instanceCount}</Info.Term> is the
        number of AWS-equivalent instances being used within a cluster of
        hardware responsible for generating a proof
      </p>
    ),
  },
  provingTime: {
    Term: () => <Info.Term type="internal">{PRIMITIVES.provingTime}</Info.Term>,
    Definition: () => (
      <p>
        <Info.Term type="internal">{PRIMITIVES.provingTime}</Info.Term> is
        duration of computation time during the proof generation process, self
        reported by proving teams in milliseconds
      </p>
    ),
  },
  gasUsed: {
    Term: () => <Info.Term type="codeTerm">{PRIMITIVES.gasUsed}</Info.Term>,
    Definition: () => (
      <p>
        <Info.Term type="codeTerm">{PRIMITIVES.gasUsed}</Info.Term> value from
        execution block header
      </p>
    ),
  },
  blockNumber: {
    Term: () => <Info.Term type="codeTerm">{PRIMITIVES.blockNumber}</Info.Term>,
    Definition: () => (
      <p>
        <Info.Term type="codeTerm">{PRIMITIVES.blockNumber}</Info.Term> value
        from execution block header
      </p>
    ),
  },
  proofSubmissionTime: {
    Term: () => (
      <Info.Term type="internal">{PRIMITIVES.proofSubmissionTime}</Info.Term>
    ),
    Definition: () => (
      <p>
        <Info.Term type="internal">{PRIMITIVES.proofSubmissionTime}</Info.Term>{" "}
        is the timestamp logged by {SITE_NAME} when a completed proof has been
        submitted
      </p>
    ),
  },
  timestamp: {
    Term: () => <Info.Term type="codeTerm">{PRIMITIVES.timestamp}</Info.Term>,
    Definition: () => (
      <p>
        <Info.Term type="codeTerm">{PRIMITIVES.timestamp}</Info.Term> value from
        execution block header
      </p>
    ),
  },
  cluster: {
    Term: () => <Info.Term type="codeTerm">{PRIMITIVES.cluster}</Info.Term>,
    Definition: () => (
      <p>
        <Info.Term type="codeTerm">{PRIMITIVES.cluster}</Info.Term> is the name
        given to a particular set of hardware being used to compute the proofs.
        Hardware, cycle type, and description of setup are all self-reported by
        proving teams, along with a selected AWS setup that best matches their
        own, used for price comparison
      </p>
    ),
  },
}

const conversions = {
  gasPerMgas: {
    Term: () => (
      <Info.Term type="codeTerm">
        10<sup>6</sup>
      </Info.Term>
    ),
    Definition: () => (
      <p>
        Divide by{" "}
        <Info.Term type="codeTerm">
          10<sup>6</sup>
        </Info.Term>{" "}
        to convert gas to megagas (Mgas)
      </p>
    ),
  },
  msToHours: {
    Term: () => <Info.Term type="codeTerm">(1000 * 60 * 60)</Info.Term>,
    Definition: () => (
      <p>
        Divide by <Info.Term type="codeTerm">(1000 * 60 * 60)</Info.Term> to
        convert milliseconds to hours
      </p>
    ),
  },
} as const satisfies Record<string, DefinitionDetails>

const computed = {
  hourlyPricePerCluster: {
    Term: () => (
      <>
        <primitives.hourlyPricePerInstance.Term /> *{" "}
        <primitives.instanceCount.Term />
      </>
    ),
    Definition: () => (
      <>
        <primitives.hourlyPricePerInstance.Definition />
        <primitives.instanceCount.Definition />
      </>
    ),
  },
  provingCosts: {
    Term: () => (
      <>
        <computed.hourlyPricePerCluster.Term /> *{" "}
        <primitives.provingTime.Term /> / <conversions.msToHours.Term />
      </>
    ),
    Definition: () => (
      <>
        <computed.hourlyPricePerCluster.Definition />
        <primitives.provingTime.Definition />
        <conversions.msToHours.Definition />
      </>
    ),
  },
  mgas: {
    Term: () => (
      <>
        <primitives.gasUsed.Term /> / <conversions.gasPerMgas.Term />
      </>
    ),
    Definition: () => (
      <>
        <primitives.gasUsed.Definition />
        <conversions.gasPerMgas.Definition />
      </>
    ),
  },
} as const satisfies Record<string, DefinitionDetails>

export { computed, conversions, primitives }

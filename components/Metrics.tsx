import * as Info from "@/components/ui/info"

import { SITE_NAME } from "@/lib/constants"

const BLOCK_NUMBER_LABEL = "block"
const CLUSTER_LABEL = "cluster"
const GAS_USED_LABEL = "gas used"
const PROVING_COSTS_LABEL = "proving costs"
const PROVING_TIME_LABEL = "proving time"
const TOTAL_TTP_LABEL = "total time to proof"
const COST_PER_MGAS_LABEL = (
  <>
    cost per <span className="uppercase">m</span>gas
  </>
)

const BlockNumberDetails = () => {
  const blockNumber = "block_number"
  return (
    <>
      <Info.Derivation>
        <Info.Term type="codeTerm">{blockNumber}</Info.Term>
      </Info.Derivation>
      <p>
        <Info.Term type="codeTerm">{blockNumber}</Info.Term> value from
        execution block header
      </p>
      <Info.Description>Block height number</Info.Description>
    </>
  )
}

const ClusterDetails = () => {
  const cluster = "cluster"
  return (
    <>
      <Info.Derivation>
        <Info.Term type="codeTerm">{cluster}</Info.Term>
      </Info.Derivation>
      <p>
        <Info.Term type="codeTerm">{cluster}</Info.Term> is the unique set of
        hardware being used to generate the proof identifier, self reported as
        AWS instance equivalents
      </p>
      <Info.Description>Cluster identifier</Info.Description>
    </>
  )
}

const CostPerMgas = () => {
  const provingCosts = "proving costs"
  const gasUsed = "gas_used"
  return (
    <>
      <Info.Derivation>
        <Info.Term type="internal">{provingCosts}</Info.Term> /{" "}
        <Info.Term type="codeTerm">{gasUsed}</Info.Term> /{" "}
        <Info.Term type="codeTerm">
          10
          <sup>6</sup>
        </Info.Term>
      </Info.Derivation>

      <p>
        <Info.Term type="internal">proving costs</Info.Term> are in USD,
        self-reported by proving teams
      </p>
      <p>
        <Info.Term type="codeTerm">gas_used</Info.Term> value from execution
        block header, expressed in millions
      </p>
      <Info.Description>
        Proving costs in USD per million gas units proven
      </Info.Description>
      <Info.Description>
        Normalized USD cost per gas unit to allow comparison amongst proofs of
        different sized blocks. More gas consumption in a block means more
        computation to prove.
      </Info.Description>
    </>
  )
}

const GasUsedDetails = () => {
  const gasUsed = "gas_used"
  return (
    <>
      <Info.Derivation>
        <Info.Term type="codeTerm">{gasUsed}</Info.Term>
      </Info.Derivation>
      <p>
        <Info.Term type="codeTerm">{gasUsed}</Info.Term> value from execution
        block header
      </p>
      <Info.Description>Total gas units executed within block</Info.Description>
      <Info.Description>
        Proportional to the amount of computational effort a block outputs. Less
        gas = less computationally intense = easier to prove.
      </Info.Description>
    </>
  )
}

const ProvingCostsDetails = ({ average }: { average?: boolean }) => {
  const provingCosts = "proving costs"
  return (
    <>
      <Info.Derivation>
        {average ? "∑(" : ""}
        <Info.Term type="internal">{provingCosts}</Info.Term>
        {average ? ") / number of completed proofs for block" : ""}
      </Info.Derivation>
      <p>
        <Info.Term type="internal">{provingCosts}</Info.Term> are in USD,
        self-reported by proving teams
      </p>
      <Info.Description>
        Proving costs in USD to prove entire block
      </Info.Description>
    </>
  )
}

const ProvingTimeDetails = ({ average }: { average?: boolean }) => {
  const provingTime = "proving time"
  return (
    <>
      <Info.Derivation>
        {average ? "∑(" : ""}
        <Info.Term type="internal">{provingTime}</Info.Term>
        {average ? ") / number of completed proofs for block" : ""}
      </Info.Derivation>
      <p>
        <Info.Term type="internal">{provingTime}</Info.Term> is duration of the
        proof generation process, self reported by proving teams
      </p>
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
  )
}

const TotalTTPDetails = () => {
  const proofSubmissionTime = "proof submission time"
  const timestamp = "timestamp"
  return (
    <>
      <Info.Derivation>
        <Info.Term type="internal">{proofSubmissionTime}</Info.Term> -{" "}
        <Info.Term type="codeTerm">{timestamp}</Info.Term>
      </Info.Derivation>
      <p>
        <Info.Term type="internal">{proofSubmissionTime}</Info.Term> is the
        timestamp logged by {SITE_NAME} when a completed proof has been
        submitted
      </p>
      <p>
        <Info.Term type="codeTerm">{timestamp}</Info.Term> value from execution
        block header
      </p>
    </>
  )
}

export {
  BLOCK_NUMBER_LABEL,
  BlockNumberDetails,
  CLUSTER_LABEL,
  ClusterDetails,
  COST_PER_MGAS_LABEL,
  CostPerMgas,
  GAS_USED_LABEL,
  GasUsedDetails,
  PROVING_COSTS_LABEL,
  PROVING_TIME_LABEL,
  ProvingCostsDetails,
  ProvingTimeDetails,
  TOTAL_TTP_LABEL,
  TotalTTPDetails,
}

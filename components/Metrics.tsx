import * as Info from "@/components/ui/info"

import { SITE_NAME } from "@/lib/constants"

const BLOCK_NUMBER_LABEL = "Block"
const CLUSTER_LABEL = "Cluster"
const PROVING_TIME_LABEL = "Proving time"
const TOTAL_TTP_LABEL = "Total time to proof"

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
  PROVING_TIME_LABEL,
  ProvingTimeDetails,
  TOTAL_TTP_LABEL,
  TotalTTPDetails,
}

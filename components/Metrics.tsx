import * as Info from "@/components/ui/info"

import { SITE_NAME } from "@/lib/constants"

const BLOCK_NUMBER_LABEL = "Block"
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

const ProvingTimeDetails = () => {
  const provingTime = "proving time"
  return (
    <>
      <Info.Derivation>
        <Info.Term type="internal">{provingTime}</Info.Term>
      </Info.Derivation>
      <p>
        <Info.Term type="internal">{provingTime}</Info.Term> is duration of the
        proof generation process, self reported by proving teams
      </p>
      <Info.Description>
        Time spent generating proof of execution
      </Info.Description>
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
  PROVING_TIME_LABEL,
  ProvingTimeDetails,
  TOTAL_TTP_LABEL,
  TotalTTPDetails,
}

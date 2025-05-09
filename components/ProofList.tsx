import { ComponentProps } from "react"

import { BlockBase } from "@/lib/types"

import ProofRow from "@/components/ProofRow"

import NoData from "./NoData"

type ProofListProps = {
  proofs: ComponentProps<typeof ProofRow>["proof"][]
  block: BlockBase
}

const ProofList = ({ proofs, block }: ProofListProps) => {
  return (
    <div>
      {proofs.length ? (
        proofs.map((proof) => (
          <ProofRow key={proof.proof_id} proof={proof} block={block} />
        ))
      ) : (
        <NoData />
      )}
    </div>
  )
}

export default ProofList

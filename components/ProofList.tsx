import { ComponentProps, useMemo } from "react"

import type { BlockBase } from "@/lib/types"

import ProofRow from "@/components/ProofRow"

import NoData from "./NoData"

type ProofListProps = {
  proofs: ComponentProps<typeof ProofRow>["proof"][]
  block: BlockBase
}

const ProofList = ({ proofs, block }: ProofListProps) => {
  const sortedProofs = useMemo(() => {
    return [...proofs].sort((a, b) => {
      if (a.proving_time === null) return 1
      if (b.proving_time === null) return -1
      return a.proving_time - b.proving_time
    })
  }, [proofs])
  return (
    <div>
      {sortedProofs.length ? (
        sortedProofs.map((proof) => (
          <ProofRow key={proof.proof_id} proof={proof} block={block} />
        ))
      ) : (
        <NoData />
      )}
    </div>
  )
}

export default ProofList

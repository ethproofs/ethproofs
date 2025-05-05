import { BlockBase, ProofWithCluster } from "@/lib/types"

import ProofRow from "@/components/ProofRow"

type ProofListProps = {
  proofs: ProofWithCluster[]
  block: BlockBase
}

const ProofList = ({ proofs, block }: ProofListProps) => {
  return (
    <div>
      {proofs.map((proof) => (
        <ProofRow key={proof.proof_id} proof={proof} block={block} />
      ))}
    </div>
  )
}

export default ProofList

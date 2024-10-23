import { Block, BlockWithProofsIds, Proof } from "@/lib/types"

export type State = {
  blocks: {
    byId: Record<number, BlockWithProofsIds>
    allIds: number[]
  }
  proofs: {
    byId: Record<number, Proof>
    allIds: number[]
  }
}

type AddBlock = { type: "add_block"; payload: Block }
type AddProof = { type: "add_proof"; payload: Proof }

export type Actions = AddBlock | AddProof

export const reducer = (state: State, action: Actions) => {
  const { type, payload } = action

  switch (type) {
    case "add_block": {
      return {
        ...state,
        blocks: {
          byId: {
            ...state.blocks.byId,
            [payload.block_number]: { ...payload, proofs: [] },
          },
          allIds: [...state.blocks.allIds, payload.block_number],
        },
      }
    }
    case "add_proof": {
      const blockNumber = payload.block_number!

      return {
        ...state,
        // update the block with the new proof
        blocks: {
          ...state.blocks,
          byId: {
            ...state.blocks.byId,
            [blockNumber]: {
              ...state.blocks.byId[blockNumber],
              proofs: [
                ...state.blocks.byId[blockNumber].proofs,
                payload.proof_id,
              ],
            },
          },
        },
        proofs: {
          byId: { ...state.proofs.byId, [payload.proof_id]: payload },
          allIds: [...state.proofs.allIds, payload.proof_id],
        },
      }
    }
  }
}

export const createInitialState = ({
  blocks,
  proofs,
}: {
  blocks: (Block & { proofs: { id: number }[] })[]
  proofs: Proof[]
}): State => ({
  blocks: {
    byId: blocks.reduce(
      (acc, block) => {
        acc[block.block_number] = {
          ...block,
          proofs: block.proofs.map(({ id }) => id),
        }
        return acc
      },
      {} as Record<number, BlockWithProofsIds>
    ),
    allIds: blocks.map((block) => block.block_number),
  },
  proofs: {
    byId: proofs.reduce(
      (acc, proof) => {
        acc[proof.proof_id] = proof
        return acc
      },
      {} as Record<number, Proof>
    ),
    allIds: proofs.map((proof) => proof.proof_id),
  },
})
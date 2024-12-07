import type { Block, BlockBase, BlocksById, Proof } from "@/lib/types"

export type State = {
  byId: BlocksById
  allIds: number[]
}

type AddBlock = { type: "add_block"; payload: BlockBase }
type UpdateBlock = { type: "update_block"; payload: BlockBase }
type AddProof = { type: "add_proof"; payload: Proof }
type UpdateProof = { type: "update_proof"; payload: Proof }

export type Actions = AddBlock | UpdateBlock | AddProof | UpdateProof

export const reducer = (state: State, action: Actions) => {
  const { type, payload } = action

  switch (type) {
    case "add_block": {
      return {
        byId: {
          ...state.byId,
          [payload.block_number]: {
            ...payload,
            proofs: [],
          },
        },
        allIds: [...state.allIds, payload.block_number],
      }
    }
    case "update_block": {
      return {
        ...state,
        byId: {
          ...state.byId,
          [payload.block_number]: {
            ...state.byId[payload.block_number],
            ...payload,
          },
        },
      }
    }
    case "add_proof": {
      return {
        ...state,
        byId: {
          ...state.byId,
          [payload.block_number]: {
            ...(state.byId[payload.block_number] || {
              block_number: payload.block_number,
            }),
            proofs: [
              ...(state.byId[payload.block_number]?.proofs || []),
              payload,
            ],
          },
        },
      }
    }
    case "update_proof": {
      return {
        ...state,
        byId: {
          ...state.byId,
          [payload.block_number]: {
            ...state.byId[payload.block_number],
            proofs: state.byId[payload.block_number].proofs.map((proof) =>
              proof.proof_id === payload.proof_id ? payload : proof
            ),
          },
        },
      }
    }
    default: {
      return state
    }
  }
}

export const createInitialState = ({ blocks }: { blocks: Block[] }): State => ({
  byId: blocks.reduce((acc, block) => {
    acc[block.block_number] = block
    return acc
  }, {} as BlocksById),
  allIds: blocks.map((block) => block.block_number),
})

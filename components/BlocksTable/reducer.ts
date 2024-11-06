import type { Block, BlockWithProofs, EmptyBlock, Proof } from "@/lib/types"

export type State = {
  blocks: {
    byId: Record<number, BlockWithProofs>
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
            [payload.block_number]: {
              ...payload,
              proofs: [],
            },
          },
          allIds: [...state.blocks.allIds, payload.block_number],
        },
      } as State
    }
    case "add_proof": {
      return {
        ...state,
        blocks: {
          ...state.blocks,
          byId: {
            ...state.blocks.byId,
            [payload.block_number]: {
              ...(state.blocks.byId[payload.block_number] || {
                block_number: payload.block_number,
              }),
              proofs: [
                ...(state.blocks.byId[payload.block_number]?.proofs || []),
                payload,
              ],
            },
          },
        },
      } as State
    }
    default: {
      return state as State
    }
  }
}

export const createInitialState = ({
  blocks,
}: {
  blocks: BlockWithProofs[]
}): State => ({
  blocks: {
    byId: blocks.reduce(
      (acc, block) => {
        acc[block.block_number] = block
        return acc
      },
      {} as Record<number, BlockWithProofs>
    ),
    allIds: blocks.map((block) => block.block_number),
  },
})

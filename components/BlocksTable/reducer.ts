import type { Block, BlockWithProofs, Proof } from "@/lib/types"

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
      }
    }
    case "add_proof": {
      const blockNumber = payload.block_number!
      const existingBlock = state.blocks.byId[blockNumber]

      if (existingBlock) {
        return {
          ...state,
          blocks: {
            ...state.blocks,
            byId: {
              ...state.blocks.byId,
              [blockNumber]: {
                ...existingBlock,
                proofs: [...existingBlock.proofs, payload],
              },
            },
          },
        }
      }

      return state
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

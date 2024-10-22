"use client"

import { BlockWithProofs, Proof } from "@/lib/types"
import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<BlockWithProofs>[] = [
  {
    accessorKey: "block_number",
    header: () => <div className="w-[100px]">Block Number</div>,
  },
  {
    accessorKey: "timestamp",
    header: "Timestamp",
  },
  {
    accessorKey: "gas_used",
    header: "Gas Used",
  },
  {
    accessorKey: "transaction_count",
    header: "Transaction Count",
  },
  {
    accessorKey: "proofs",
    header: "Proofs",
    cell: ({ cell }) => {
      const proofs = cell.getValue() as Proof[]
      return (
        <div className="flex flex-wrap gap-2">
          {proofs.map((proof) => (
            <div key={proof.proof_id}>{proof.proof_id}</div>
          ))}
        </div>
      )
    },
  },
]

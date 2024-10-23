"use client"

import { ColumnDef } from "@tanstack/react-table"

export type Block = {
  block_number: number
  gas_used: number
  timestamp: string
  transaction_count: number
  proofs: { id: number }[]
}

export const columns: ColumnDef<Block>[] = [
  { accessorKey: "block_number", header: "Block" },
  { accessorKey: "timestamp", header: "Timestamp" },
  { accessorKey: "gas_used", header: "Total fees" },
  { accessorKey: "transaction_count", header: "Transactions" },
]

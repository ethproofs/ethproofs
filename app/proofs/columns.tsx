"use client"

import { ColumnDef } from "@tanstack/react-table"

export type Proof = {
  block_number: number;
  proof: string;
  proof_id: number;
  proof_status: string;
  prover_duration: unknown;
  prover_machine_id: number | null;
  proving_cost: number | null;
  proving_cycles: number | null;
  submission_time: string | null;
  user_id: string;
}

export const columns: ColumnDef<Proof>[] = [
  { accessorKey: "proof_id", header: "PID" },
  { accessorKey: "block_number", header: "Block" },
  { accessorKey: "proof", header: "Proof" },
  { accessorKey: "proof_status", header: "Status" },
  { accessorKey: "prover_machine_id", header: "Machine" },
  { accessorKey: "prover_duration", header: "Prover Duration" },
  { accessorKey: "proving_cost", header: "Proving Cost" },
  { accessorKey: "proving_cycles", header: "Proving Cycles" },
  { accessorKey: "submission_time", header: "Submission Time" },
  { accessorKey: "user_id", header: "UID" },
]

"use client"

import { ProofsTable } from "./proofs-table"

import { useBlockProofs } from "@/lib/hooks/queries/use-block-proofs"

interface BlockProofsSectionProps {
  blockId: string
  filterType?: "all" | "single" | "multi"
  className?: string
}

export function BlockProofsSection({
  blockId,
  filterType,
  className,
}: BlockProofsSectionProps) {
  const { proofs, rowCount, tableState, isLoading } = useBlockProofs(blockId, {
    filterType,
  })

  return (
    <ProofsTable
      className={className}
      proofs={proofs}
      rowCount={rowCount}
      tableState={tableState}
      isLoading={isLoading}
      toolbarFilterColumnId="team"
      toolbarFilterPlaceholder="filter by team..."
    />
  )
}

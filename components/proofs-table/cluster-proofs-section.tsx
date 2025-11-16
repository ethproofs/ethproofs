"use client"

import { ProofsTable } from "./proofs-table"
import { useClusterProofs } from "./use-cluster-proofs"

interface ClusterProofsSectionProps {
  clusterId: string
  className?: string
}

export function ClusterProofsSection({
  clusterId,
  className,
}: ClusterProofsSectionProps) {
  const { proofs, rowCount, tableState, isLoading } =
    useClusterProofs(clusterId)

  return (
    <ProofsTable
      className={className}
      proofs={proofs}
      rowCount={rowCount}
      tableState={tableState}
      isLoading={isLoading}
      toolbarFilterColumnId="block_number"
      toolbarFilterPlaceholder="filter by block number..."
    />
  )
}

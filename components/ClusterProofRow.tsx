import { differenceInMilliseconds } from "date-fns"

import { Block, ProofWithCluster, Team } from "@/lib/types"

import BlockNumber from "@/components/BlockNumber"
import Null from "@/components/Null"
import DownloadButton from "@/components/proof-buttons/DownloadButton"

import { cn } from "@/lib/utils"

import VerifyButton from "./proof-buttons/VerifyButton"

import { formatTimeAgo } from "@/lib/date"
import { formatUsd } from "@/lib/number"
import { getProvingCost } from "@/lib/proofs"
import { prettyMs } from "@/lib/time"

export type RowProof = Required<
  Pick<
    ProofWithCluster,
    | "block_number"
    | "proved_timestamp"
    | "proving_time"
    | "cluster_version"
    | "proof_status"
    | "proof_id"
    | "size_bytes"
  >
> & {
  block: Required<Pick<Block, "timestamp" | "gas_used">>
  team: Required<Pick<Team, "name">>
}

export type ClusterProofRowProps = {
  proof: RowProof
}

export const ClusterProofRow = ({ proof }: ClusterProofRowProps) => {
  const costPerProof = getProvingCost(proof as ProofWithCluster)
  const costPerMgas = costPerProof
    ? costPerProof / (proof.block.gas_used / 1e6)
    : null

  // TODO: Mobile responsiveness
  return (
    <div
      data-grid-template-areas="cluster-proof"
      className={cn(
        "grid gap-x-6 border-b border-primary-border p-6",
        "grid-cols-[auto_auto] gap-y-4",
        "md:grid-cols-[1fr_1fr_auto_auto]",
        "lg:grid-cols-[1fr_repeat(3,_auto)]",
        "xl:grid-cols-[1fr_repeat(4,_auto)]"
      )}
    >
      <div className="my-auto" style={{ gridArea: "block" }}>
        <BlockNumber blockNumber={proof.block_number} />
        <div className="font-sans text-xs text-body-secondary">
          {proof.proved_timestamp ? (
            formatTimeAgo(proof.proved_timestamp)
          ) : (
            <Null />
          )}
        </div>
      </div>

      <div
        className="my-auto flex flex-col items-center"
        style={{ gridArea: "time" }}
      >
        <div className="text-nowrap font-mono text-sm">
          proving:{" "}
          {proof.proving_time ? prettyMs(proof.proving_time) : <Null />}
        </div>
        <div className="font-sans text-xs text-body-secondary">
          total to proof:{" "}
          {proof.proved_timestamp ? (
            prettyMs(
              differenceInMilliseconds(
                new Date(proof.proved_timestamp),
                new Date(proof.block.timestamp)
              )
            )
          ) : (
            <Null />
          )}
        </div>
      </div>

      <div
        className="my-auto flex flex-col items-center"
        style={{ gridArea: "cost" }}
      >
        <div className="text-nowrap font-mono text-sm">
          per proof: {costPerProof ? formatUsd(costPerProof) : <Null />}
        </div>
        <div className="font-sans text-xs text-body-secondary">
          per Mgas: {costPerMgas ? formatUsd(costPerMgas) : <Null />}
        </div>
      </div>

      <div style={{ gridArea: "download" }}>
        <DownloadButton proof={proof} className="w-40" />
      </div>

      <div style={{ gridArea: "verify" }}>
        <VerifyButton proof={proof} className="w-40" />
      </div>
    </div>
  )
}

export default ClusterProofRow

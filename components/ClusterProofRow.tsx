import { differenceInMilliseconds } from "date-fns"

import { Block, ProofWithCluster, Team } from "@/lib/types"

import BlockNumber from "@/components/BlockNumber"
import DownloadButton from "@/components/DownloadButton"
import Null from "@/components/Null"
import CalendarCheck from "@/components/svgs/calendar-check.svg"
import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"

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
      data-row="cluster-proof"
      className={cn(
        "grid-custom-areas grid gap-x-6 border-b border-primary-border p-6",
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

      <DownloadButton
        proof={proof}
        className="w-full"
        containerStyle={{ gridArea: "download" }}
      />

      <div
        className="my-auto flex flex-col items-center"
        style={{ gridArea: "verify" }}
      >
        <Button disabled variant="solid" className="w-full py-0.5">
          <CalendarCheck className="text-lg" />
          verify
        </Button>
        <div className="text-center font-sans text-xs text-body-secondary">
          in-browser (soon™)
        </div>
      </div>
    </div>
  )
}

export default ClusterProofRow

import { formatTimeAgo } from "./date"
import { formatNumber } from "./number"
import {
  getCostPerMgasStats,
  getCostPerProofStats,
  getProofsPerStatusCount,
  getProvingTimeStats,
  getTotalTTPStats,
} from "./proofs"
import type { Block } from "./types"

export function exportBlocksToCSV(blocks: Block[], filename = "blocks-export") {
  if (blocks.length === 0) {
    console.warn("No blocks to export")
    return
  }

  // Define CSV headers
  const headers = [
    "Block Number",
    "Timestamp",
    "Gas Used",
    "Transaction Count",
    "Hash",
    "Total Proofs",
    "Proved Proofs",
    "Failed Proofs",
    "Queued Proofs",
    "Cost Per Proof (min)",
    "Cost Per Proof (max)",
    "Cost Per Proof (avg)",
    "Cost Per Mgas (min)",
    "Cost Per Mgas (max)",
    "Cost Per Mgas (avg)",
    "Proving Time (min)",
    "Proving Time (max)",
    "Proving Time (avg)",
    "Total Time to Proof",
  ]

  // Convert blocks to CSV rows
  const rows = blocks.map((block) => {
    const { proofs, gas_used, timestamp } = block

    // Calculate stats
    const statusCount = getProofsPerStatusCount(proofs)
    const costPerProofStats = getCostPerProofStats(proofs)
    const costPerMgasStats = getCostPerMgasStats(proofs, gas_used)
    const provingTimeStats = getProvingTimeStats(proofs)
    const totalTTPStats = timestamp ? getTotalTTPStats(proofs, timestamp) : null

    return [
      block.block_number,
      timestamp ? new Date(timestamp).toISOString() : "",
      gas_used || "",
      block.transaction_count || "",
      block.hash || "",
      proofs.length,
      statusCount.proved || 0,
      statusCount.failed || 0,
      statusCount.queued || 0,
      costPerProofStats?.best || "",
      costPerProofStats?.avg || "",
      costPerMgasStats?.best || "",
      costPerMgasStats?.avg || "",
      provingTimeStats?.best || "",
      provingTimeStats?.avg || "",
      totalTTPStats?.bestFormatted || "",
    ]
  })

  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((field) =>
          // Escape commas and quotes in CSV fields
          typeof field === "string" &&
          (field.includes(",") || field.includes('"'))
            ? `"${field.replace(/"/g, '""')}"`
            : field
        )
        .join(",")
    ),
  ].join("\n")

  // Create and download file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

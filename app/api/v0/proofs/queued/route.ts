import { ne } from "drizzle-orm"
import { revalidateTag } from "next/cache"
import { ZodError } from "zod"

import { isUndefined } from "@/lib/utils"

import { TAGS } from "@/lib/constants"

import { db } from "@/db"
import { proofs } from "@/db/schema"
import { findOrCreateBlock } from "@/lib/api/blocks"
import { withAuthAndRateLimit } from "@/lib/middleware/with-rate-limit"
import { queuedProofSchema } from "@/lib/zod/schemas/proof"

export const POST = withAuthAndRateLimit(
  async ({ request, user, timestamp }) => {
    const payload = await request.json()
    const teamId = user.id

    let proofPayload
    try {
      proofPayload = queuedProofSchema.parse(payload)
    } catch (error) {
      console.error("Proof payload invalid:", error)
      if (error instanceof ZodError) {
        return new Response(`Invalid request: ${error.message}`, {
          status: 400,
        })
      }

      return new Response("Invalid request", { status: 400 })
    }

    const { block_number, cluster_id } = proofPayload

    // Get cluster uuid from cluster_id
    const cluster = await db.query.clusters.findFirst({
      columns: {
        id: true,
      },
      where: (clusters, { and, eq }) =>
        and(eq(clusters.index, cluster_id), eq(clusters.team_id, teamId)),
    })

    if (isUndefined(cluster)) {
      console.error("cluster not found", cluster_id)
      return new Response("Cluster not found", { status: 404 })
    }

    const clusterVersion = await db.query.clusterVersions.findFirst({
      columns: {
        id: true,
      },
      where: (clusterVersions, { eq }) =>
        eq(clusterVersions.cluster_id, cluster.id),
      orderBy: (clusterVersions, { desc }) => [
        desc(clusterVersions.created_at),
      ],
    })

    if (isUndefined(clusterVersion)) {
      console.error("Cluster version not found:", cluster_id)
      return new Response("Cluster version not found", { status: 404 })
    }

    // Ensure block exists (must be synchronous)
    try {
      const block = await findOrCreateBlock(block_number)
      console.log(`[Queued] Block ${block} found by team:`, teamId)
    } catch (error) {
      console.error(
        `[Queued] Block ${block_number} not found by team:`,
        teamId,
        error
      )
      return new Response("Internal server error", {
        status: 500,
      })
    }

    // Check if proof already exists and is proved
    const existingProof = await db.query.proofs.findFirst({
      columns: {
        proof_id: true,
        proof_status: true,
      },
      where: (proofs, { and, eq }) =>
        and(
          eq(proofs.block_number, block_number),
          eq(proofs.cluster_version_id, clusterVersion.id)
        ),
    })

    if (existingProof && existingProof.proof_status === "proved") {
      console.log(
        `[Queued] Proof already proved for block ${block_number} by team:`,
        teamId
      )
      return new Response("Proof already proved", {
        status: 409,
      })
    }

    const dataToInsert = {
      ...proofPayload,
      block_number,
      cluster_id: cluster.id,
      cluster_version_id: clusterVersion.id,
      proof_status: "queued",
      queued_timestamp: timestamp,
      team_id: teamId,
    }

    try {
      const [proof] = await db
        .insert(proofs)
        .values(dataToInsert)
        .onConflictDoUpdate({
          target: [proofs.block_number, proofs.cluster_version_id],
          set: {
            proof_status: "queued",
            queued_timestamp: timestamp,
          },
          where: ne(proofs.proof_status, "proved"),
        })
        .returning({ proof_id: proofs.proof_id })

      revalidateTag(TAGS.BLOCKS)
      revalidateTag(`cluster-${cluster.id}`)
      revalidateTag(`block-${block_number}`)

      return Response.json(proof)
    } catch (error) {
      console.error("[Queued] Error adding proof:", error)
      return new Response("Internal server error", {
        status: 500,
      })
    }
  }
)

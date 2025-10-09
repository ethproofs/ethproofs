import { revalidateTag } from "next/cache"
import { ZodError } from "zod"

import { isUndefined } from "@/lib/utils"

import { TAGS } from "@/lib/constants"

import { db } from "@/db"
import { proofs } from "@/db/schema"
import { findOrCreateBlock } from "@/lib/api/blocks"
import { logger, traced } from "@/lib/logger"
import { proofSubmissions } from "@/lib/otel-metrics"
import { withAuth } from "@/lib/middleware/with-auth"
import { queuedProofSchema } from "@/lib/zod/schemas/proof"

// TODO:TEAM - refactor code to use baseProofHandler and abstract out the logic
export const POST = withAuth(async ({ request, user, timestamp }) => {
  const payload = await request.json()
  const teamId = user.id

  let proofPayload
  try {
    proofPayload = queuedProofSchema.parse(payload)
  } catch (error) {
    logger.error("Queued proof payload validation failed", error, {
      team_id: teamId,
    })
    if (error instanceof ZodError) {
      return new Response(`Invalid request: ${error.message}`, {
        status: 400,
      })
    }

    return new Response("Invalid request", { status: 400 })
  }

  const { block_number, cluster_id } = proofPayload

  const log = logger.child({ team_id: teamId, block_number, cluster_id })

  return traced(
    "POST /api/v0/proofs/queued",
    async () => {
      log.info("Processing queued proof submission")

      // Get cluster uuid from cluster_id
      const cluster = await db.query.clusters.findFirst({
        columns: {
          id: true,
        },
        where: (clusters, { and, eq }) =>
          and(eq(clusters.index, cluster_id), eq(clusters.team_id, teamId)),
      })

      if (isUndefined(cluster)) {
        log.error("Cluster not found")
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
        log.error("Cluster version not found")
        return new Response("Cluster version not found", { status: 404 })
      }

      try {
        const block = await findOrCreateBlock(block_number)
        log.info("Block found/created for queued proof", {
          block_number: block,
        })
      } catch (error) {
        log.error("Failed to find/create block", error)
        return new Response("Internal server error", {
          status: 500,
        })
      }

      const dataToInsert = {
        ...proofPayload,
        block_number,
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
          })
          .returning({ proof_id: proofs.proof_id })

        revalidateTag(TAGS.BLOCKS)
        revalidateTag(`cluster-${cluster.id}`)
        revalidateTag(`block-${block_number}`)

        log.info("Queued proof stored successfully", {
          proof_id: proof.proof_id,
        })

        proofSubmissions.add(1, {
          status: "queued",
          team_id: teamId,
        })

        return Response.json(proof)
      } catch (error) {
        log.error("Failed to store queued proof", error)
        return new Response("Internal server error", {
          status: 500,
        })
      }
    },
    {
      block_number,
      team_id: teamId,
    }
  )
})

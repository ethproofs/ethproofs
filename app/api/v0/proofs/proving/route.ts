import { revalidateTag } from "next/cache"
import { ZodError } from "zod"

import { TAGS } from "@/lib/constants"

import { db } from "@/db"
import { proofs } from "@/db/schema"
import { withAuth } from "@/lib/middleware/with-auth"
import { provingProofSchema } from "@/lib/zod/schemas/proof"

// TODO:TEAM - refactor code to use baseProofHandler and abstract out the logic
export const POST = withAuth(async ({ request, user, timestamp }) => {
  const payload = await request.json()

  let proofPayload
  try {
    proofPayload = provingProofSchema.parse(payload)
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
      and(eq(clusters.index, cluster_id), eq(clusters.team_id, user.id)),
  })

  if (!cluster) {
    console.error("Cluster not found:", cluster_id)
    return new Response("Cluster not found", { status: 404 })
  }

  const clusterVersion = await db.query.clusterVersions.findFirst({
    columns: {
      id: true,
    },
    where: (clusterVersions, { eq }) =>
      eq(clusterVersions.cluster_id, cluster.id),
    orderBy: (clusterVersions, { desc }) => [desc(clusterVersions.created_at)],
  })

  if (!clusterVersion) {
    console.error("Cluster version not found:", cluster_id)
    return new Response("Cluster version not found", { status: 404 })
  }

  const dataToInsert = {
    ...proofPayload,
    block_number,
    cluster_version_id: clusterVersion.id,
    proof_status: "proving",
    proving_timestamp: timestamp,
    team_id: user.id,
  }

  try {
    const [proof] = await db
      .insert(proofs)
      .values(dataToInsert)
      .onConflictDoUpdate({
        target: [proofs.block_number, proofs.cluster_version_id],
        set: {
          proof_status: "proving",
          proving_timestamp: timestamp,
        },
      })
      .returning({ proof_id: proofs.proof_id })

    revalidateTag(TAGS.PROOFS)
    revalidateTag(TAGS.BLOCKS)
    revalidateTag(`cluster-${cluster.id}`)
    revalidateTag(`block-${block_number}`)

    return Response.json(proof)
  } catch (error) {
    console.error("[Proving] Error adding proof:", error)
    return new Response("Internal server error", {
      status: 500,
    })
  }
})

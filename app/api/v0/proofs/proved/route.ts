import { eq, ne } from "drizzle-orm"
import { revalidateTag } from "next/cache"
import { ZodError } from "zod"

import { TAGS } from "@/lib/constants"

import { db } from "@/db"
import { clusters, programs, proofs } from "@/db/schema"
import { updateBlock } from "@/lib/api/blocks"
import { uploadProofBinary } from "@/lib/api/proof-binaries"
import { isStorageQuotaExceeded } from "@/lib/api/storage"
import { getTeam } from "@/lib/api/teams"
import { withAuth } from "@/lib/middleware/with-auth"
import { provedProofSchema } from "@/lib/zod/schemas/proof"

// TODO:TEAM - refactor code to use baseProofHandler and abstract out the logic
export const POST = withAuth(async ({ request, user, timestamp }) => {
  const payload = await request.json()
  const teamId = user.id

  let proofPayload
  try {
    proofPayload = provedProofSchema.parse(payload)
  } catch (error) {
    console.error("Proof payload invalid:", error)
    if (error instanceof ZodError) {
      return new Response(`Invalid request: ${error.message}`, {
        status: 400,
      })
    }

    return new Response("Invalid request", { status: 400 })
  }

  const { block_number, cluster_id, verifier_id, proof, ...restProofPayload } =
    proofPayload

  // Get cluster uuid from cluster_id
  const cluster = await db.query.clusters.findFirst({
    columns: {
      id: true,
    },
    where: (clusters, { and, eq }) =>
      and(eq(clusters.index, cluster_id), eq(clusters.team_id, teamId)),
  })

  if (!cluster) {
    console.error("cluster not found", cluster_id)
    return new Response("Cluster not found", { status: 404 })
  }

  const clusterVersion = await db.query.clusterVersions.findFirst({
    columns: {
      id: true,
    },
    with: {
      cluster: true,
    },
    where: (clusterVersions, { eq }) =>
      eq(clusterVersions.cluster_id, cluster.id),
    orderBy: (clusterVersions, { desc }) => [desc(clusterVersions.created_at)],
  })

  if (!clusterVersion) {
    console.error("Cluster version not found:", cluster_id)
    return new Response("Cluster version not found", { status: 404 })
  }

  try {
    const block = await updateBlock(block_number)
    console.log(`[Proved] Block ${block} updated by team:`, teamId)
  } catch (error) {
    console.error(
      `[Proved] Block ${block_number} not updated by team:`,
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
      `[Proved] Proof already proved for block ${block_number} by team:`,
      teamId
    )
    return new Response("Proof already proved", {
      status: 409,
    })
  }

  // TODO:TEAM - revisit this code, is it still needed?
  let programId: number | undefined
  if (verifier_id) {
    const existingProgram = await db.query.programs.findFirst({
      columns: {
        id: true,
      },
      where: (programs, { eq }) => eq(programs.verifier_id, verifier_id),
    })

    programId = existingProgram?.id

    if (!existingProgram) {
      try {
        const [program] = await db
          .insert(programs)
          .values({
            verifier_id,
          })
          .returning()

        programId = program?.id
      } catch (error) {
        console.error("Error creating program:", error)
      }
    }
  }

  const binaryBuffer = Buffer.from(proof, "base64")

  const dataToInsert = {
    ...restProofPayload,
    block_number,
    cluster_id: cluster.id,
    cluster_version_id: clusterVersion.id,
    program_id: programId,
    proof_status: "proved",
    proved_timestamp: timestamp,
    size_bytes: binaryBuffer.byteLength,
    team_id: teamId,
  }

  try {
    const newProof = await db.transaction(async (tx) => {
      const [newProof] = await tx
        .insert(proofs)
        .values(dataToInsert)
        .onConflictDoUpdate({
          target: [proofs.block_number, proofs.cluster_version_id],
          set: {
            ...dataToInsert,
          },
          where: ne(proofs.proof_status, "proved"),
        })
        .returning({ proof_id: proofs.proof_id })

      // Handle active cluster status and updates
      if (!clusterVersion.cluster.is_active) {
        await tx
          .update(clusters)
          .set({
            is_active: true,
          })
          .where(eq(clusters.id, cluster.id))

        // Invalidate active clusters stats
        revalidateTag(TAGS.CLUSTERS)
        revalidateTag(TAGS.CLUSTER_SUMMARY)
      }

      return newProof
    })

    revalidateTag(TAGS.PROOFS)
    revalidateTag(TAGS.BLOCKS)
    revalidateTag(`cluster-${cluster.id}`)
    revalidateTag(`block-${block_number}`)

    // TODO:TEAM - revisit the need for storage quota
    // const storageQuotaExceeded = await isStorageQuotaExceeded(
    //   teamId,
    //   binaryBuffer.byteLength
    // )
    const storageQuotaExceeded = false
    // if (storageQuotaExceeded) {
    //   console.log(`[Storage Quota Exceeded] team ${teamId} has reached quota`)
    // }

    // Upload proof binary asynchronously after returning response
    if (!storageQuotaExceeded) {
      void (async () => {
        try {
          const team = await getTeam(teamId)
          const teamSlug = team?.slug ? team.slug : cluster.id.split("-")[0]
          const filename = `${teamSlug}_${cluster.id}_${newProof.proof_id}.bin`
          await uploadProofBinary(filename, binaryBuffer)
        } catch (error) {
          console.error(
            `[Proved] Error uploading proof binary for proof_id ${newProof.proof_id}:`,
            error
          )
        }
      })()
    }

    return Response.json(newProof)
  } catch (error) {
    console.error("[Proved] Error adding proof:", error)
    return new Response("Internal server error", {
      status: 500,
    })
  }
})

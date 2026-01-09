import { desc } from "drizzle-orm"
import { ZodError } from "zod"

import { db } from "@/db"
import { clusters, clusterVersions } from "@/db/schema"
import { getZkvmVersion } from "@/lib/api/zkvm-versions"
import { withAuth } from "@/lib/middleware/with-auth"
import { createClusterSchema } from "@/lib/zod/schemas/cluster"

export const GET = withAuth(async ({ user }) => {
  try {
    const clusters = await db.query.clusters.findMany({
      columns: {
        index: true,
        name: true,
      },
      where: (cluster, { eq }) => eq(cluster.team_id, user.id),
      with: {
        versions: {
          columns: {
            id: true,
          },
        },
      },
    })

    return Response.json(
      clusters.map(({ index, ...cluster }) => ({
        id: index,
        ...cluster,
      }))
    )
  } catch (error) {
    console.error("error fetching clusters", error)
    return new Response("Internal server error", { status: 500 })
  }
})

export const POST = withAuth(async ({ request, user }) => {
  const requestBody = await request.json()

  let clusterPayload
  try {
    clusterPayload = createClusterSchema.parse(requestBody)
  } catch (error) {
    console.error("cluster payload invalid", error)

    if (error instanceof ZodError) {
      return new Response(error.message, {
        status: 400,
      })
    }

    return new Response("Invalid payload", {
      status: 400,
    })
  }

  const { name, zkvm_version_id, num_gpus, hardware_description } =
    clusterPayload

  const zkvmVersion = await getZkvmVersion(zkvm_version_id)

  if (!zkvmVersion) {
    return new Response("Invalid zkvm version", { status: 400 })
  }

  let clusterIndex: number | null = null
  await db.transaction(async (tx) => {
    // Derive prover_type_id from num_gpus (default to cloud-hosted types)
    const multiGpuProverTypeId = 1
    const singleGpuProverTypeId = 3
    const prover_type_id =
      num_gpus > 1 ? multiGpuProverTypeId : singleGpuProverTypeId

    const [cluster] = await tx
      .insert(clusters)
      .values({
        name,
        hardware_description,
        num_gpus,
        prover_type_id,
        team_id: user.id,
      })
      .returning({ id: clusters.id, index: clusters.index })

    // Get the next version index for this cluster
    const lastVersion = await tx.query.clusterVersions.findFirst({
      where: (cv, { eq }) => eq(cv.cluster_id, cluster.id),
      columns: { index: true },
      orderBy: (cv) => desc(cv.index),
    })
    const nextIndex = (lastVersion?.index ?? 0) + 1

    await tx
      .insert(clusterVersions)
      .values({
        cluster_id: cluster.id,
        index: nextIndex,
        zkvm_version_id,
        is_active: true,
      })
      .returning({ id: clusterVersions.id })

    clusterIndex = cluster.index
  })

  return Response.json({ id: clusterIndex })
})

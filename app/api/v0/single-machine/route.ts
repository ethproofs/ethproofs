import { ZodError } from "zod"

import { db } from "@/db"
import { clusterConfigurations, clusters } from "@/db/schema"
import { withAuth } from "@/lib/middleware/with-auth"
import { singleMachineSchema } from "@/lib/zod/schemas/cluster"

export const POST = withAuth(async ({ request, user }) => {
  const requestBody = await request.json()

  // validate payload schema
  let singleMachinePayload
  try {
    singleMachinePayload = singleMachineSchema.parse(requestBody)
  } catch (error) {
    console.error("single machine payload invalid", error)
    if (error instanceof ZodError) {
      return new Response(`Invalid payload: ${error.message}`, {
        status: 400,
      })
    }

    return new Response("Invalid payload", {
      status: 400,
    })
  }

  const {
    nickname,
    description,
    hardware,
    cycle_type,
    proof_type,
    cloud_instance,
  } = singleMachinePayload

  // get & validate cloud instance id
  const cloudInstance = await db.query.cloudInstances.findFirst({
    columns: {
      id: true,
      instance_name: true,
    },
    where: (cloudInstances, { eq }) =>
      eq(cloudInstances.instance_name, cloud_instance),
  })

  if (!cloudInstance) {
    return new Response("Cloud instance not found", { status: 400 })
  }

  let clusterIndex: number | null = null
  await db.transaction(async (tx) => {
    // create cluster for single machine
    const [cluster] = await tx
      .insert(clusters)
      .values({
        nickname,
        description,
        hardware,
        cycle_type,
        proof_type,
        team_id: user.id,
      })
      .returning({ id: clusters.id, index: clusters.index })

    // create single machine as a cluster with 1 instance
    await tx.insert(clusterConfigurations).values({
      cluster_id: cluster.id,
      cloud_instance_id: cloudInstance.id,
      cloud_instance_count: 1,
    })

    clusterIndex = cluster.index
  })

  return Response.json({ id: clusterIndex })
})

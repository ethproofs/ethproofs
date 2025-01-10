import { ZodError } from "zod"

import { db } from "@/db"
import { clusterConfigurations, clusters } from "@/db/schema"
import { withAuth } from "@/lib/auth/with-auth"
import { singleMachineSchema } from "@/lib/zod/schemas/cluster"

export const POST = withAuth(async ({ request, user }) => {
  const requestBody = await request.json()

  if (!user) {
    return new Response("Invalid API key", {
      status: 401,
    })
  }

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
    instance_type,
  } = singleMachinePayload

  // get & validate instance type id
  const instanceType = await db.query.awsInstancePricing.findFirst({
    columns: {
      id: true,
      instance_type: true,
    },
    where: (awsInstancePricing, { eq }) =>
      eq(awsInstancePricing.instance_type, instance_type),
  })

  if (!instanceType) {
    return new Response("Instance type not found", { status: 400 })
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
      instance_type_id: instanceType.id,
      instance_count: 1,
    })

    clusterIndex = cluster.index
  })

  return Response.json({ id: clusterIndex })
})

import { db } from "@/db"
import { clusterConfigurations, clusters } from "@/db/schema"
import { withAuth } from "@/lib/auth/withAuth"
import { createClusterSchema } from "@/lib/zod/schemas/cluster"

export const GET = withAuth(async ({ user }) => {
  if (!user) {
    return new Response("Invalid API key", {
      status: 401,
    })
  }

  try {
    const clusters = await db.query.clusters.findMany({
      columns: {
        index: true,
        nickname: true,
        description: true,
        hardware: true,
        cycle_type: true,
        proof_type: true,
      },
      where: (cluster, { eq }) => eq(cluster.user_id, user.id),
      with: {
        cluster_configuration: {
          columns: {
            instance_type_id: true,
            instance_count: true,
          },
          with: {
            aws_instance_pricing: true,
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

  if (!user) {
    return new Response("Invalid API key", {
      status: 401,
    })
  }

  // validate payload schema
  let clusterPayload
  try {
    clusterPayload = createClusterSchema.parse(requestBody)
  } catch (error) {
    console.error("cluster payload invalid", error)
    return new Response("Invalid payload", {
      status: 400,
    })
  }

  const {
    nickname,
    description,
    hardware,
    configuration,
    cycle_type,
    proof_type,
  } = clusterPayload

  // get & validate instance type ids
  const instanceTypeIds = await db.query.awsInstancePricing.findMany({
    columns: {
      id: true,
      instance_type: true,
    },
    where: (awsInstancePricing, { inArray }) =>
      inArray(
        awsInstancePricing.instance_type,
        configuration.map((config) => config.instance_type)
      ),
  })

  if (instanceTypeIds.length !== configuration.length) {
    return new Response("Invalid cluster configuration", { status: 400 })
  }

  let clusterIndex: number | null = null
  await db.transaction(async (tx) => {
    // create cluster
    const [cluster] = await tx
      .insert(clusters)
      .values({
        nickname,
        description,
        hardware,
        cycle_type,
        proof_type,
        user_id: user.id,
      })
      .returning({ id: clusters.id, index: clusters.index })

    // create cluster configuration
    const instanceTypeById = instanceTypeIds.reduce(
      (acc, instanceType) => {
        acc[instanceType.instance_type] = instanceType.id
        return acc
      },
      {} as Record<string, number>
    )

    await tx.insert(clusterConfigurations).values(
      configuration.map(({ instance_type, instance_count }) => ({
        cluster_id: cluster.id,
        instance_type_id: instanceTypeById[instance_type],
        instance_count,
      }))
    )

    clusterIndex = cluster.index
  })

  return Response.json({ id: clusterIndex })
})

import { db } from "@/db"
import { clusterConfigurations, clusterMachines, clusters } from "@/db/schema"
import { tmp_renameClusterConfiguration } from "@/lib/clusters"
import { withAuth } from "@/lib/middleware/with-auth"
import { createClusterSchema } from "@/lib/zod/schemas/cluster"

export const GET = withAuth(async ({ user }) => {
  try {
    const clusters = await db.query.clusters.findMany({
      columns: {
        index: true,
        nickname: true,
        description: true,
        cycle_type: true,
        proof_type: true,
      },
      where: (cluster, { eq }) => eq(cluster.team_id, user.id),
      with: {
        cc: {
          columns: {
            cloud_instance_id: true,
            cloud_instance_count: true,
            cluster_machine_id: true,
            cluster_machine_count: true,
          },
          with: {
            ci: true,
            cluster_machine: true,
          },
        },
      },
    })

    const renamedClusters = clusters.map(tmp_renameClusterConfiguration)

    return Response.json(
      renamedClusters.map(({ index, ...cluster }) => ({
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

  // get & validate cloud instance ids
  const cloudInstanceIds = await db.query.cloudInstances.findMany({
    columns: {
      id: true,
      instance_name: true,
    },
    where: (cloudInstances, { inArray }) =>
      inArray(
        cloudInstances.instance_name,
        configuration.map((config) => config.cloud_instance)
      ),
  })

  if (cloudInstanceIds.length !== configuration.length) {
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
        team_id: user.id,
      })
      .returning({ id: clusters.id, index: clusters.index })

    // create cluster configuration
    const cloudInstanceByName = cloudInstanceIds.reduce(
      (acc, cloudInstance) => {
        acc[cloudInstance.instance_name] = cloudInstance.id
        return acc
      },
      {} as Record<string, number>
    )

    // create cluster machines
    const clusterMachineIds = await tx
      .insert(clusterMachines)
      .values(
        configuration.map(({ cluster_machine }) => ({
          gpu_models: cluster_machine.gpu_models,
          memory_gb: cluster_machine.memory_gb,
          memory_specification: cluster_machine.memory_specification,
          network_configuration: cluster_machine.network_configuration,
        }))
      )
      .returning({ id: clusterMachines.id })

    // create cluster configurations
    await tx.insert(clusterConfigurations).values(
      configuration.map(
        (
          { cloud_instance, cloud_instance_count, cluster_machine_count },
          index
        ) => ({
          cluster_id: cluster.id,
          cluster_machine_id: clusterMachineIds[index].id,
          cluster_machine_count,
          cloud_instance_id: cloudInstanceByName[cloud_instance],
          cloud_instance_count,
        })
      )
    )

    clusterIndex = cluster.index
  })

  return Response.json({ id: clusterIndex })
})

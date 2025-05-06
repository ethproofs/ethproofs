import { ZodError } from "zod"

import { db } from "@/db"
import {
  clusterMachines,
  clusters,
  clusterVersions,
  machines,
} from "@/db/schema"
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
        versions: {
          columns: {
            id: true,
          },
          with: {
            cluster_machines: {
              columns: {
                id: true,
                machine_count: true,
                cloud_instance_count: true,
              },
              with: {
                cloud_instance: true,
                machine: true,
              },
            },
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

  // validate payload schema
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

  const {
    nickname,
    description,
    zkvm_version_id,
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
        configuration.map((config) => config.cloud_instance_name)
      ),
  })

  if (cloudInstanceIds.length !== configuration.length) {
    return new Response("Invalid cluster configuration", { status: 400 })
  }

  const isMultiMachine =
    configuration.length > 1 ||
    configuration.some((config) => config.machine_count > 1)

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
        is_multi_machine: isMultiMachine,
        team_id: user.id,
      })
      .returning({ id: clusters.id, index: clusters.index })

    // create cluster version
    const [clusterVersion] = await tx
      .insert(clusterVersions)
      .values({
        cluster_id: cluster.id,
        zkvm_version_id,
        // TODO: remove this once we have a real version management system for users
        version: "v0.1",
      })
      .returning({ id: clusterVersions.id })

    // create machines
    const createdMachines = await tx
      .insert(machines)
      .values(configuration.map(({ machine }) => machine))
      .returning({ id: machines.id })

    // map cloud instance names to ids
    const cloudInstanceByName = cloudInstanceIds.reduce(
      (acc, cloudInstance) => {
        acc[cloudInstance.instance_name] = cloudInstance.id
        return acc
      },
      {} as Record<string, number>
    )

    // create cluster configurations
    await tx.insert(clusterMachines).values(
      configuration.map(
        (
          { cloud_instance_name, cloud_instance_count, machine_count },
          index
        ) => ({
          cluster_version_id: clusterVersion.id,
          machine_id: createdMachines[index].id,
          machine_count,
          cloud_instance_id: cloudInstanceByName[cloud_instance_name],
          cloud_instance_count,
        })
      )
    )

    clusterIndex = cluster.index
  })

  return Response.json({ id: clusterIndex })
})

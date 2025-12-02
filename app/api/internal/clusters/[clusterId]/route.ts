import { ZodError } from "zod"

import { db } from "@/db"
import {
  clusterMachines,
  clusters,
  clusterVersions,
  machines,
} from "@/db/schema"
import { getZkvmVersion } from "@/lib/api/zkvm-versions"
import { withAuth } from "@/lib/middleware/with-auth"
import { updateClusterSchema } from "@/lib/zod/schemas/cluster"

/**
 * Increment version string (e.g., "v0.1" -> "v0.2", "v0.9" -> "v0.10")
 */
function incrementVersion(version: string): string {
  const match = version.match(/^v(\d+)\.(\d+)$/)
  if (!match) {
    // Fallback for non-standard versions
    return `${version}-1`
  }

  const [, major, minor] = match
  const nextMinor = parseInt(minor, 10) + 1
  return `v${major}.${nextMinor}`
}

export const PUT = withAuth(async ({ request, user }, context: { params: Promise<{ clusterId: string }> }) => {
  const { clusterId } = await context.params
  const requestBody = await request.json()

  // Validate payload schema
  let updatePayload
  try {
    updatePayload = updateClusterSchema.parse(requestBody)
  } catch (error) {
    console.error("cluster update payload invalid", error)

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
    cycle_type,
    proof_type,
    zkvm_version_id,
    configuration,
  } = updatePayload

  try {
    // Get the cluster and verify ownership
    const cluster = await db.query.clusters.findFirst({
      where: (c, { eq, and }) =>
        and(eq(c.id, clusterId), eq(c.team_id, user.id)),
      with: {
        versions: {
          orderBy: (cv, { desc }) => desc(cv.created_at),
          limit: 1,
        },
      },
    })

    if (!cluster) {
      return new Response("Cluster not found", { status: 404 })
    }

    const lastVersion = cluster.versions[0]
    if (!lastVersion) {
      return new Response("Cluster has no versions", { status: 500 })
    }

    // Check if we need to create a new version (configuration or zkvm changed)
    const configurationChanged = configuration !== undefined
    const zkvmChanged = zkvm_version_id !== undefined && zkvm_version_id !== lastVersion.zkvm_version_id

    // Validate zkvm_version_id if provided
    if (zkvmChanged) {
      const zkvmVersion = await getZkvmVersion(zkvm_version_id!)

      if (!zkvmVersion) {
        return new Response("Invalid zkvm version", { status: 400 })
      }
    }

    // Validate cloud instances if configuration provided
    if (configurationChanged) {
      const cloudInstanceIds = await db.query.cloudInstances.findMany({
        columns: {
          id: true,
          instance_name: true,
        },
        where: (cloudInstances, { inArray }) =>
          inArray(
            cloudInstances.instance_name,
            configuration!.map((config) => config.cloud_instance_name)
          ),
      })

      if (cloudInstanceIds.length !== configuration!.length) {
        return new Response("Invalid cluster configuration", { status: 400 })
      }
    }

    let versionId = lastVersion.id

    await db.transaction(async (tx) => {
      // Update cluster metadata if provided
      if (nickname !== undefined || description !== undefined || cycle_type !== undefined || proof_type !== undefined) {
        await tx
          .update(clusters)
          .set({
            ...(nickname !== undefined && { nickname }),
            ...(description !== undefined && { description }),
            ...(cycle_type !== undefined && { cycle_type }),
            ...(proof_type !== undefined && { proof_type }),
          })
          .where((c) => c.id === clusterId)
      }

      // Create new version if configuration or zkvm changed
      if (configurationChanged || zkvmChanged) {
        const newVersionString = incrementVersion(lastVersion.version)

        // Create new cluster version
        const [newVersion] = await tx
          .insert(clusterVersions)
          .values({
            cluster_id: clusterId,
            zkvm_version_id: zkvmChanged ? zkvm_version_id! : lastVersion.zkvm_version_id,
            version: newVersionString,
          })
          .returning({ id: clusterVersions.id })

        versionId = newVersion.id

        // If configuration provided, create new machines and cluster machines
        if (configurationChanged) {
          // Get cloud instance IDs
          const cloudInstanceIds = await tx.query.cloudInstances.findMany({
            columns: {
              id: true,
              instance_name: true,
            },
            where: (cloudInstances, { inArray }) =>
              inArray(
                cloudInstances.instance_name,
                configuration!.map((config) => config.cloud_instance_name)
              ),
          })

          const cloudInstanceByName = cloudInstanceIds.reduce(
            (acc, cloudInstance) => {
              acc[cloudInstance.instance_name] = cloudInstance.id
              return acc
            },
            {} as Record<string, number>
          )

          // Create machines
          const createdMachines = await tx
            .insert(machines)
            .values(configuration!.map(({ machine }) => machine))
            .returning({ id: machines.id })

          // Create cluster machines
          await tx.insert(clusterMachines).values(
            configuration!.map(
              (
                { cloud_instance_name, cloud_instance_count, machine_count },
                index
              ) => ({
                cluster_version_id: newVersion.id,
                machine_id: createdMachines[index].id,
                machine_count,
                cloud_instance_id: cloudInstanceByName[cloud_instance_name],
                cloud_instance_count,
              })
            )
          )

          // Check if configuration is multi-machine and update cluster flag
          const isMultiMachine =
            configuration!.length > 1 ||
            configuration!.some((config) => config.machine_count > 1)

          await tx
            .update(clusters)
            .set({ is_multi_machine: isMultiMachine })
            .where((c) => c.id === clusterId)
        }
      }
    })

    return Response.json({
      version_id: versionId,
      message: configurationChanged || zkvmChanged ? "Cluster updated. New version created." : "Cluster updated.",
    })
  } catch (error) {
    console.error("error updating cluster", error)
    return new Response("Internal server error", { status: 500 })
  }
})

import { and, eq } from "drizzle-orm"
import { ZodError } from "zod"

import { db } from "@/db"
import { clusters } from "@/db/schema"
import {
  createClusterVersion,
  getProverTypes,
  updateClusterMetadata,
} from "@/lib/api/clusters"
import { getZkvmVersion } from "@/lib/api/zkvm-versions"
import { withAuth } from "@/lib/middleware/with-auth"
import { updateClusterApiSchema } from "@/lib/zod/schemas/cluster"

export const PATCH = withAuth<{ id: string }>(
  async ({ request, user }, { id }) => {
    const clusterIndex = parseInt(id, 10)
    if (isNaN(clusterIndex)) {
      return new Response("Invalid cluster ID", { status: 400 })
    }

    const cluster = await db.query.clusters.findFirst({
      where: and(
        eq(clusters.team_id, user.id),
        eq(clusters.index, clusterIndex)
      ),
      with: {
        versions: {
          where: (cv, { eq }) => eq(cv.is_active, true),
          limit: 1,
        },
      },
    })

    if (!cluster) {
      return new Response("Cluster not found", { status: 404 })
    }

    let payload
    try {
      const requestBody = await request.json()
      payload = updateClusterApiSchema.parse(requestBody)
    } catch (error) {
      if (error instanceof ZodError) {
        return new Response(error.message, { status: 400 })
      }
      return new Response("Invalid payload", { status: 400 })
    }

    const {
      name,
      num_gpus,
      hardware_description,
      is_active,
      zkvm_version_id,
      vk_path,
    } = payload

    const hasMetadataChanges =
      name !== undefined ||
      num_gpus !== undefined ||
      hardware_description !== undefined ||
      is_active !== undefined

    const hasVersionChanges =
      zkvm_version_id !== undefined || vk_path !== undefined

    if (!hasMetadataChanges && !hasVersionChanges) {
      return new Response("No fields to update", { status: 400 })
    }

    if (is_active !== undefined && is_active !== cluster.is_active) {
      const targetProverTypeId = cluster.prover_type_id
      if (is_active && targetProverTypeId) {
        const existingActiveCluster = await db.query.clusters.findFirst({
          where: and(
            eq(clusters.team_id, cluster.team_id),
            eq(clusters.prover_type_id, targetProverTypeId),
            eq(clusters.is_active, true)
          ),
        })

        if (existingActiveCluster && existingActiveCluster.id !== cluster.id) {
          return new Response(
            "Active cluster of this prover type already exists",
            {
              status: 409,
            }
          )
        }
      }
    }

    if (num_gpus !== undefined && num_gpus !== cluster.num_gpus) {
      const proverTypes = await getProverTypes()
      const currentProverType = proverTypes.find(
        (pt) => pt.id === cluster.prover_type_id
      )
      if (currentProverType) {
        const newGpuConfiguration = num_gpus > 1 ? "multi-gpu" : "single-gpu"
        const currentGpuConfiguration = currentProverType.gpu_configuration
        if (newGpuConfiguration !== currentGpuConfiguration) {
          return new Response(
            `Changing num_gpus from ${cluster.num_gpus} to ${num_gpus} would change GPU configuration from ${currentGpuConfiguration} to ${newGpuConfiguration}. This is not supported via API.`,
            { status: 400 }
          )
        }
      }
    }

    if (zkvm_version_id !== undefined) {
      const zkvmVersion = await getZkvmVersion(zkvm_version_id)
      if (!zkvmVersion) {
        return new Response("Invalid zkvm_version_id", { status: 400 })
      }
    }

    if (hasMetadataChanges) {
      const metadataUpdate: {
        name?: string
        num_gpus?: number
        hardware_description?: string
        is_active?: boolean
      } = {}

      if (name !== undefined) metadataUpdate.name = name
      if (num_gpus !== undefined) metadataUpdate.num_gpus = num_gpus
      if (hardware_description !== undefined)
        metadataUpdate.hardware_description = hardware_description
      if (is_active !== undefined) metadataUpdate.is_active = is_active

      await updateClusterMetadata(cluster.id, metadataUpdate)
    }

    if (hasVersionChanges) {
      const activeVersion = cluster.versions[0]
      const currentZkvmVersionId = activeVersion?.zkvm_version_id
      const currentVkPath = activeVersion?.vk_path

      const zkvmVersionChanged =
        zkvm_version_id !== undefined &&
        zkvm_version_id !== currentZkvmVersionId
      const vkPathChanged = vk_path !== undefined && vk_path !== currentVkPath

      if (zkvmVersionChanged || vkPathChanged) {
        await createClusterVersion(cluster.id, {
          zkvm_version_id: zkvm_version_id ?? currentZkvmVersionId,
          vk_path: vk_path ?? currentVkPath ?? undefined,
        })
      }
    }

    return Response.json({ success: true })
  }
)

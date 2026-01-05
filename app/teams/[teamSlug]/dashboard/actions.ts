"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { z } from "zod"

import { API_KEY_MANAGER_ROLE, TAGS } from "@/lib/constants"

import { db } from "@/db"
import { clusters, clusterVersions } from "@/db/schema"
import { createClusterVersion, updateClusterMetadata } from "@/lib/api/clusters"
import { getTeamBySlug } from "@/lib/api/teams"
import { getZkvmVersion } from "@/lib/api/zkvm-versions"
import { createClient } from "@/utils/supabase/server"

const createClusterSchema = z.object({
  name: z.string().max(50, "name must be 50 characters or less"),
  zkvm_version_id: z.coerce.number().int().positive("zkvm version is required"),
  num_gpus: z.coerce.number().int().positive("number of gpus must be positive"),
  hardware_description: z
    .string()
    .max(200, "hardware description must be 200 characters or less")
    .optional()
    .nullable()
    .transform((val) => val ?? undefined),
})

const updateClusterSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(50, "name must be 50 characters or less").optional(),
  zkvm_version_id: z.coerce
    .number()
    .int()
    .positive("zkvm version is required")
    .optional(),
  num_gpus: z.coerce
    .number()
    .int()
    .positive("number of gpus must be positive")
    .optional(),
  hardware_description: z
    .string()
    .max(200, "hardware description must be 200 characters or less")
    .optional()
    .nullable()
    .transform((val) => val ?? undefined),
  vk_path: z.string().optional().nullable().transform((val) => val ?? undefined),
})

export async function createCluster(_prevState: unknown, formData: FormData) {
  // Get current user and verify authentication
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      errors: {
        _form: ["you must be logged in to create a cluster"],
      },
    }
  }

  // Validate form data
  const validatedFields = createClusterSchema.safeParse({
    name: formData.get("name"),
    zkvm_version_id: formData.get("zkvm_version_id"),
    num_gpus: formData.get("num_gpus"),
    hardware_description: formData.get("hardware_description") || undefined,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, zkvm_version_id, num_gpus, hardware_description } =
    validatedFields.data

  // Get team slug from form data
  const teamSlug = formData.get("team_slug") as string

  try {
    const isAdmin = user.role === API_KEY_MANAGER_ROLE

    // Get the team
    const team = await getTeamBySlug(teamSlug)
    if (!team) {
      return {
        errors: {
          _form: ["team not found"],
        },
      }
    }

    // Verify permission (admins can create for any team, users can only create for their own team)
    if (!isAdmin && team.id !== user.id) {
      return {
        errors: {
          _form: ["you do not have permission to create clusters for this team"],
        },
      }
    }

    // Validate zkvm_version_id
    const zkvmVersion = await getZkvmVersion(zkvm_version_id)
    if (!zkvmVersion) {
      return {
        errors: {
          zkvm_version_id: ["invalid zkvm version"],
        },
      }
    }

    // Create cluster and version in database
    let clusterId: string | null = null
    let versionId: number | null = null

    await db.transaction(async (tx) => {
      // Create cluster
      const [cluster] = await tx
        .insert(clusters)
        .values({
          name,
          hardware_description,
          is_multi_gpu: num_gpus > 1,
          num_gpus,
          team_id: team.id,
          is_active: true,
        })
        .returning({ id: clusters.id })

      clusterId = cluster.id

      // Create initial cluster version
      const [version] = await tx
        .insert(clusterVersions)
        .values({
          cluster_id: cluster.id,
          index: 1,
          zkvm_version_id,
          is_active: true,
        })
        .returning({ id: clusterVersions.id })

      versionId = version.id
    })

    // Revalidate cache
    revalidatePath(`/teams/${teamSlug}/dashboard`)
    revalidateTag(TAGS.CLUSTERS)

    return {
      success: true,
      clusterId,
      versionId,
    }
  } catch (error) {
    console.error("Error creating cluster:", error)
    return {
      errors: {
        _form: ["an unexpected error occurred"],
      },
    }
  }
}

export async function updateCluster(_prevState: unknown, formData: FormData) {
  // Get current user and verify authentication
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      errors: {
        _form: ["you must be logged in to update a cluster"],
      },
    }
  }

  // Validate form data
  const validatedFields = updateClusterSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name") || undefined,
    zkvm_version_id: formData.get("zkvm_version_id") || undefined,
    num_gpus: formData.get("num_gpus") || undefined,
    hardware_description: formData.get("hardware_description") || undefined,
    vk_path: formData.get("vk_path") || undefined,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { id, name, zkvm_version_id, num_gpus, hardware_description, vk_path } =
    validatedFields.data

  // Get original cluster data to determine what changed
  const originalName = formData.get("original_name") as string
  const originalZkvmVersionId = parseInt(
    formData.get("original_zkvm_version_id") as string
  )
  const originalNumGpus = parseInt(formData.get("original_num_gpus") as string)
  const originalHardwareDescription = formData.get(
    "original_hardware_description"
  ) as string
  const originalVkPath = formData.get("original_vk_path") as string
  const teamSlug = formData.get("team_slug") as string

  try {
    const isAdmin = user.role === API_KEY_MANAGER_ROLE

    // Verify cluster ownership
    const cluster = await db.query.clusters.findFirst({
      where: (cluster, { eq }) => eq(cluster.id, id),
    })

    if (!cluster) {
      return {
        errors: {
          _form: ["cluster not found"],
        },
      }
    }

    // Verify permission (admins can edit any team's clusters, users can only edit their own)
    if (!isAdmin && cluster.team_id !== user.id) {
      return {
        errors: {
          _form: ["you do not have permission to edit this cluster"],
        },
      }
    }

    // Determine which fields changed
    const metadataChanged =
      (name !== undefined && name !== originalName) ||
      (num_gpus !== undefined && num_gpus !== originalNumGpus) ||
      (hardware_description !== undefined &&
        hardware_description !== originalHardwareDescription)

    const versionChanged =
      (zkvm_version_id !== undefined &&
        zkvm_version_id !== originalZkvmVersionId) ||
      (vk_path !== undefined && vk_path !== originalVkPath)

    // Update metadata if changed
    if (metadataChanged) {
      const metadataUpdate: {
        name?: string
        num_gpus?: number
        hardware_description?: string
      } = {}

      if (name !== undefined && name !== originalName)
        metadataUpdate.name = name
      if (num_gpus !== undefined && num_gpus !== originalNumGpus)
        metadataUpdate.num_gpus = num_gpus
      if (
        hardware_description !== undefined &&
        hardware_description !== originalHardwareDescription
      ) {
        metadataUpdate.hardware_description = hardware_description
      }

      await updateClusterMetadata(id, metadataUpdate)
    }

    // Create new version if version fields changed
    if (versionChanged) {
      // Validate zkvm_version_id if it changed
      if (
        zkvm_version_id !== undefined &&
        zkvm_version_id !== originalZkvmVersionId
      ) {
        const zkvmVersion = await getZkvmVersion(zkvm_version_id)
        if (!zkvmVersion) {
          return {
            errors: {
              zkvm_version_id: ["invalid zkvm version"],
            },
          }
        }
      }

      await createClusterVersion(id, {
        zkvm_version_id: zkvm_version_id ?? originalZkvmVersionId,
        vk_path: vk_path ?? originalVkPath,
      })
    }

    // Revalidate cache
    revalidatePath(`/teams/${teamSlug}/dashboard`)
    revalidateTag(TAGS.CLUSTERS)
    revalidateTag(`cluster-${id}`)

    return {
      success: true,
      clusterId: id,
    }
  } catch (error) {
    console.error("Error updating cluster:", error)
    return {
      errors: {
        _form: ["an unexpected error occurred"],
      },
    }
  }
}

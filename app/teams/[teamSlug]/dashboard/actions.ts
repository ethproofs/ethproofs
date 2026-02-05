"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath, revalidateTag } from "next/cache"
import { z } from "zod"

import { API_KEY_MANAGER_ROLE, TAGS } from "@/lib/constants"

import { db } from "@/db"
import { clusters, clusterVersions } from "@/db/schema"
import { createClusterVersion, updateClusterMetadata } from "@/lib/api/clusters"
import { getTeamBySlug, updateTeam } from "@/lib/api/teams"
import { getZkvmVersion } from "@/lib/api/zkvm-versions"
import { createClient } from "@/utils/supabase/server"

const createClusterSchema = z.object({
  name: z.string().max(50, "name must be 50 characters or less"),
  zkvm_version_id: z.coerce.number().int().positive("zkvm version is required"),
  num_gpus: z.coerce.number().int().positive("number of gpus must be positive"),
  prover_type_id: z.coerce.number().int().positive("prover type is required"),
  guest_program_id: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .nullable()
    .transform((val) => val ?? undefined),
  is_active: z
    .string()
    .transform((val) => {
      if (val === "on") return true
      if (val === "false") return false
      return true
    })
    .optional(),
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
  prover_type_id: z.coerce.number().int().positive().optional(),
  guest_program_id: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .nullable()
    .transform((val) => val ?? undefined),
  is_active: z
    .string()
    .transform((val) => {
      if (val === "on" || val === "true") return true
      if (val === "false") return false
      return undefined
    })
    .optional(),
  hardware_description: z
    .string()
    .max(200, "hardware description must be 200 characters or less")
    .optional()
    .nullable()
    .transform((val) => val ?? undefined),
  vk_path: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val ?? undefined),
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

  const validatedFields = createClusterSchema.safeParse({
    name: formData.get("name"),
    zkvm_version_id: formData.get("zkvm_version_id"),
    num_gpus: formData.get("num_gpus"),
    prover_type_id: formData.get("prover_type_id"),
    guest_program_id: formData.get("guest_program_id") || undefined,
    is_active: formData.get("is_active") || undefined,
    hardware_description: formData.get("hardware_description") || undefined,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const {
    name,
    zkvm_version_id,
    num_gpus,
    prover_type_id,
    guest_program_id,
    is_active,
    hardware_description,
  } = validatedFields.data

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
          _form: [
            "you do not have permission to create clusters for this team",
          ],
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

    // Validate and fetch prover_type
    const proverType = await db.query.proverTypes.findFirst({
      where: (proverTypes, { eq }) => eq(proverTypes.id, prover_type_id),
    })

    if (!proverType) {
      return {
        errors: {
          prover_type_id: ["invalid prover type"],
        },
      }
    }

    // Check if team already has an active cluster of this prover type (only if creating as active)
    if (is_active) {
      const existingActiveCluster = await db.query.clusters.findFirst({
        where: and(
          eq(clusters.team_id, team.id),
          eq(clusters.prover_type_id, prover_type_id),
          eq(clusters.is_active, true)
        ),
      })

      if (existingActiveCluster) {
        return {
          errors: {
            is_active: ["active cluster of this type already exists"],
          },
        }
      }
    }

    // Create cluster and version in database
    let clusterId: string | null = null
    let versionId: number | null = null

    await db.transaction(async (tx) => {
      const [cluster] = await tx
        .insert(clusters)
        .values({
          name,
          hardware_description,
          num_gpus,
          prover_type_id,
          guest_program_id,
          team_id: team.id,
          is_active: is_active ?? true,
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

    revalidatePath(`/teams/${teamSlug}/dashboard`)
    revalidateTag(TAGS.CLUSTERS)
    revalidateTag(`team-clusters-${team.id}`)

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

  const validatedFields = updateClusterSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name") || undefined,
    zkvm_version_id: formData.get("zkvm_version_id") || undefined,
    num_gpus: formData.get("num_gpus") || undefined,
    prover_type_id: formData.get("prover_type_id") || undefined,
    guest_program_id: formData.get("guest_program_id") || undefined,
    is_active: formData.get("is_active") || undefined,
    hardware_description: formData.get("hardware_description") || undefined,
    vk_path: formData.get("vk_path") || undefined,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const {
    id,
    name,
    zkvm_version_id,
    num_gpus,
    prover_type_id,
    guest_program_id,
    is_active,
    hardware_description,
    vk_path,
  } = validatedFields.data

  const originalName = formData.get("original_name") as string
  const originalZkvmVersionId = parseInt(
    formData.get("original_zkvm_version_id") as string
  )
  const originalNumGpus = parseInt(formData.get("original_num_gpus") as string)
  const originalProverTypeId = formData.get("original_prover_type_id")
    ? parseInt(formData.get("original_prover_type_id") as string)
    : null
  const originalGuestProgramId = formData.get("original_guest_program_id")
    ? parseInt(formData.get("original_guest_program_id") as string)
    : null
  const originalIsActive = formData.get("original_is_active") === "true"
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

    // Check if prover_type_id or is_active changed
    const proverTypeChanged =
      prover_type_id !== undefined && prover_type_id !== originalProverTypeId
    const isActiveChanged =
      is_active !== undefined && is_active !== originalIsActive

    // If trying to activate or change to a type that already has an active cluster
    if (proverTypeChanged || isActiveChanged) {
      const targetProverTypeId = proverTypeChanged
        ? prover_type_id
        : originalProverTypeId
      const targetIsActive = isActiveChanged ? is_active : originalIsActive

      // Only check if the target state is active
      if (targetIsActive && targetProverTypeId) {
        const existingActiveCluster = await db.query.clusters.findFirst({
          where: and(
            eq(clusters.team_id, cluster.team_id),
            eq(clusters.prover_type_id, targetProverTypeId),
            eq(clusters.is_active, true)
          ),
        })

        // If there's an existing active cluster and it's not the current cluster
        if (existingActiveCluster && existingActiveCluster.id !== id) {
          return {
            errors: {
              is_active: ["active cluster of this type already exists"],
            },
          }
        }
      }
    }

    const guestProgramChanged =
      guest_program_id !== undefined &&
      guest_program_id !== originalGuestProgramId

    const metadataChanged =
      (name !== undefined && name !== originalName) ||
      (num_gpus !== undefined && num_gpus !== originalNumGpus) ||
      (hardware_description !== undefined &&
        hardware_description !== originalHardwareDescription) ||
      proverTypeChanged ||
      guestProgramChanged ||
      isActiveChanged

    const versionChanged =
      (zkvm_version_id !== undefined &&
        zkvm_version_id !== originalZkvmVersionId) ||
      (vk_path !== undefined && vk_path !== originalVkPath)

    if (metadataChanged) {
      const metadataUpdate: {
        name?: string
        num_gpus?: number
        hardware_description?: string
        prover_type_id?: number
        guest_program_id?: number | null
        is_active?: boolean
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
      if (proverTypeChanged) {
        metadataUpdate.prover_type_id = prover_type_id
      }
      if (guestProgramChanged) {
        metadataUpdate.guest_program_id = guest_program_id ?? null
      }
      if (isActiveChanged) metadataUpdate.is_active = is_active

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

    revalidatePath(`/teams/${teamSlug}/dashboard`)
    revalidateTag(TAGS.CLUSTERS)
    revalidateTag(`team-clusters-${cluster.team_id}`)
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

const updateTeamProfileSchema = z.object({
  team_id: z.string().uuid(),
  name: z
    .string()
    .min(1, "name is required")
    .max(100, "name must be 100 characters or less"),
  github_org: z
    .string()
    .max(100, "github org must be 100 characters or less")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  twitter_handle: z
    .string()
    .max(50, "twitter handle must be 50 characters or less")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  website_url: z
    .string()
    .max(200, "website url must be 200 characters or less")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val))
    .refine(
      (val) => {
        if (!val) return true
        try {
          new URL(val)
          return true
        } catch {
          return false
        }
      },
      { message: "invalid url format" }
    ),
})

export async function updateTeamProfile(
  _prevState: unknown,
  formData: FormData
) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      errors: {
        _form: ["you must be logged in to update team profile"],
      },
    }
  }

  const validatedFields = updateTeamProfileSchema.safeParse({
    team_id: formData.get("team_id"),
    name: formData.get("name"),
    github_org: formData.get("github_org") || null,
    twitter_handle: formData.get("twitter_handle") || null,
    website_url: formData.get("website_url") || null,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { team_id, name, github_org, twitter_handle, website_url } =
    validatedFields.data

  try {
    const isAdmin = user.role === API_KEY_MANAGER_ROLE

    if (!isAdmin && team_id !== user.id) {
      return {
        errors: {
          _form: ["you do not have permission to edit this team"],
        },
      }
    }

    const team = await getTeamBySlug(
      (formData.get("team_slug") as string) || ""
    )
    if (!team || team.id !== team_id) {
      return {
        errors: {
          _form: ["team not found"],
        },
      }
    }

    await updateTeam(team_id, {
      name,
      github_org,
      twitter_handle,
      website_url,
    })

    revalidatePath(`/teams/${team.slug}/dashboard`)
    revalidatePath(`/teams/${team.slug}`)
    revalidateTag(TAGS.TEAMS)

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error updating team profile:", error)
    return {
      errors: {
        _form: ["an unexpected error occurred"],
      },
    }
  }
}

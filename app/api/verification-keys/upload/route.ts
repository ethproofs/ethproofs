import { eq } from "drizzle-orm"
import { revalidateTag } from "next/cache"
import { NextRequest } from "next/server"

import { API_KEY_MANAGER_ROLE, TAGS } from "@/lib/constants"

import { db } from "@/db"
import { clusterVersions } from "@/db/schema"
import { getTeam } from "@/lib/api/teams"
import { uploadVerificationKey } from "@/lib/api/verification-keys"
import { createClient } from "@/utils/supabase/server"

export const POST = async (request: NextRequest) => {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll("file") as File[]

    if (files.length === 0) {
      return new Response("No file provided", { status: 400 })
    }

    if (files.length > 2) {
      return new Response("Maximum 2 vk files allowed", { status: 400 })
    }

    const clusterId = formData.get("cluster_id") as string
    if (!clusterId) {
      return new Response("No cluster_id provided", { status: 400 })
    }

    const versionId = formData.get("version_id") as string
    if (!versionId) {
      return new Response("No version_id provided", { status: 400 })
    }

    const cluster = await db.query.clusters.findFirst({
      where: (c, { eq }) => eq(c.id, clusterId),
      columns: {
        team_id: true,
      },
    })

    if (!cluster) {
      return new Response("Cluster not found", { status: 404 })
    }

    const isAdmin = user.role === API_KEY_MANAGER_ROLE
    if (!isAdmin && cluster.team_id !== user.id) {
      return new Response("Forbidden", { status: 403 })
    }

    const team = await getTeam(cluster.team_id)
    if (!team) {
      return new Response("Team not found", { status: 404 })
    }

    // Verify the version exists and belongs to this cluster
    const version = await db.query.clusterVersions.findFirst({
      where: (cv, { and, eq }) =>
        and(eq(cv.id, Number(versionId)), eq(cv.cluster_id, clusterId)),
    })

    if (!version) {
      return new Response("Version not found for this cluster", { status: 404 })
    }

    const teamSlug = team.slug ? team.slug : team.name.toLowerCase()
    const baseStem = `${teamSlug}_${clusterId}_${version.index}`
    const isMultiPart = files.length > 1

    const uploadedPaths: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const filename = isMultiPart
        ? `${baseStem}_${i}.bin`
        : `${baseStem}.bin`

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const result = await uploadVerificationKey(filename, buffer)

      if (!result) {
        return new Response(`Failed to upload file ${i}`, { status: 500 })
      }

      uploadedPaths.push(result.path)
    }

    await db
      .update(clusterVersions)
      .set({ vk_path: uploadedPaths[0] })
      .where(eq(clusterVersions.id, Number(versionId)))

    revalidateTag(TAGS.CLUSTERS)
    revalidateTag(`team-clusters-${cluster.team_id}`)
    revalidateTag(`cluster-${clusterId}`)

    const generatedFilename = isMultiPart
      ? `${baseStem}_0.bin, ${baseStem}_1.bin`
      : `${baseStem}.bin`

    return new Response(
      JSON.stringify({
        message: "Verification key uploaded",
        paths: uploadedPaths,
        version_id: versionId,
        filename: generatedFilename,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
  } catch (error) {
    console.error("Error uploading vk:", error)
    return new Response("Internal server error", { status: 500 })
  }
}

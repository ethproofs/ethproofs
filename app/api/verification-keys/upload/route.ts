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
    const file = formData.get("file") as File

    if (!file) {
      return new Response("No file provided", { status: 400 })
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
    const generatedFilename = `${teamSlug}_${clusterId}_${version.index}.bin`

    // Convert File to Buffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await uploadVerificationKey(generatedFilename, buffer)

    if (!result) {
      return new Response("Failed to upload file", { status: 500 })
    }

    await db
      .update(clusterVersions)
      .set({ vk_path: result.path })
      .where(eq(clusterVersions.id, Number(versionId)))

    revalidateTag(TAGS.CLUSTERS)
    revalidateTag(`team-clusters-${cluster.team_id}`)
    revalidateTag(`cluster-${clusterId}`)

    return new Response(
      JSON.stringify({
        message: "Verification key uploaded",
        path: result.path,
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

import { desc, eq } from "drizzle-orm"
import { NextRequest } from "next/server"

import { db } from "@/db"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ clusterId: string }> }
) {
  try {
    const { clusterId } = await params

    const versions = await db.query.clusterVersions.findMany({
      where: (cv, { eq }) => eq(cv.cluster_id, clusterId),
      orderBy: (cv) => desc(cv.created_at),
      columns: {
        id: true,
        index: true,
        created_at: true,
        is_active: true,
        vk_path: true,
      },
    })

    return new Response(
      JSON.stringify({
        versions,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
  } catch (error) {
    console.error("Error fetching cluster versions:", error)
    return new Response("Internal server error", { status: 500 })
  }
}

import { db } from "@/db"
import { downloadVerificationKey } from "@/lib/api/verification-keys"
import { withRateLimit } from "@/lib/middleware/with-rate-limit"

export const GET = withRateLimit(
  async () => {
    try {
      // Query all active cluster versions with their vk paths
      const activeClusterVersions = await db.query.clusterVersions.findMany({
        where: (cv, { and, eq, isNotNull }) =>
          and(eq(cv.is_active, true), isNotNull(cv.vk_path)),
        with: {
          cluster: {
            columns: {
              id: true,
              index: true,
              is_multi_machine: true,
            },
            with: {
              team: {
                columns: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          zkvm_version: {
            columns: {
              id: true,
              version: true,
            },
            with: {
              zkvm: {
                columns: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      })

      if (activeClusterVersions.length === 0) {
        return Response.json([])
      }

      // Download all active verification keys
      const results = await Promise.all(
        activeClusterVersions.map(async (version) => {
          if (!version.vk_path) {
            return null
          }

          // Filter to only multi-machine clusters
          if (!version.cluster.is_multi_machine) {
            return null
          }

          const blob = await downloadVerificationKey(version.vk_path)

          if (!blob) {
            console.warn(
              `vk not found for cluster ${version.cluster.id}, path: ${version.vk_path}`
            )
            return null
          }

          // Convert blob to base64
          const arrayBuffer = await blob.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          const base64 = buffer.toString("base64")

          return {
            cluster_id: version.cluster.id,
            cluster_version_index: version.index,
            team: version.cluster.team.slug,
            zkvm: version.zkvm_version.zkvm.slug,
            vk_path: version.vk_path,
            vk_binary: base64,
          }
        })
      )

      // Filter out null results
      const validResults = results.filter((r) => r !== null)

      return Response.json(validResults)
    } catch (error) {
      console.error("Error fetching active verification keys:", error)
      return new Response("Internal server error", { status: 500 })
    }
  },
  { requests: 10, window: 60 }
)

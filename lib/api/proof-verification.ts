import { eq } from "drizzle-orm"

import { isVerifiableZkvm, type VerifiableZkvmSlug } from "../zkvm-verifiers"

import { db } from "@/db"
import { clusters, clusterVersions } from "@/db/schema"

export interface ProofVerificationInfo {
  clusterId: string
  vkPath: string
  zkvmSlug: VerifiableZkvmSlug
}

/**
 * Get proof verification info for a specific cluster
 * Returns null if proofs from this cluster cannot be verified (no vk_path or unsupported zkvm)
 */
export async function getProofVerificationInfo(
  clusterId: string
): Promise<ProofVerificationInfo | null> {
  const cluster = await db.query.clusters.findFirst({
    where: eq(clusters.id, clusterId),
    with: {
      versions: {
        where: eq(clusterVersions.is_active, true),
        with: {
          zkvm_version: {
            with: {
              zkvm: true,
            },
          },
        },
      },
    },
  })

  if (!cluster?.versions[0]) {
    return null
  }

  const activeVersion = cluster.versions[0]
  const zkvmSlug = activeVersion.zkvm_version.zkvm.slug

  // Check if cluster has vk_path and zkvm has a verifier implementation
  if (!activeVersion.vk_path || !isVerifiableZkvm(zkvmSlug)) {
    return null
  }

  return {
    clusterId: cluster.id,
    vkPath: activeVersion.vk_path,
    zkvmSlug,
  }
}

/**
 * Get all clusters that can produce verifiable proofs (have vk_path and supported zkvm)
 */
export async function getClustersWithVerifiableProofs(): Promise<
  ProofVerificationInfo[]
> {
  const allClusters = await db.query.clusters.findMany({
    with: {
      versions: {
        where: eq(clusterVersions.is_active, true),
        with: {
          zkvm_version: {
            with: {
              zkvm: true,
            },
          },
        },
      },
    },
  })

  const clustersWithVerification: ProofVerificationInfo[] = []

  for (const cluster of allClusters) {
    const activeVersion = cluster.versions[0]
    if (!activeVersion?.vk_path) continue

    const zkvmSlug = activeVersion.zkvm_version.zkvm.slug
    if (!isVerifiableZkvm(zkvmSlug)) continue

    clustersWithVerification.push({
      clusterId: cluster.id,
      vkPath: activeVersion.vk_path,
      zkvmSlug,
    })
  }

  return clustersWithVerification
}

/**
 * Check if proofs from this cluster can be verified
 */
export async function canVerifyProofs(clusterId: string): Promise<boolean> {
  const info = await getProofVerificationInfo(clusterId)
  return info !== null
}

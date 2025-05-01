import { desc, eq } from "drizzle-orm"

import type { Cluster } from "../types"

import { db } from "@/db"
import {
  cloudInstances,
  clusterMachines,
  clusters,
  clusterVersions,
  machines,
} from "@/db/schema"

export const getCluster = async (id: string) => {
  const cluster = await db.query.clusters.findFirst({
    where: (clusters, { eq }) => eq(clusters.id, id),
  })

  return cluster
}

export const getClusters = async () => {
  const clusters = await db.query.clusters.findMany({
    with: {
      versions: {
        orderBy: desc(clusterVersions.created_at),
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
  return clusters
}

export const getClustersByTeamId = async (teamId: string) => {
  const clusters = await db.query.clusters.findMany({
    where: (clusters, { eq }) => eq(clusters.team_id, teamId),
  })

  return clusters
}

export const getClusterById = async (clusterId: string) => {
  const cluster = await db.query.clusters.findFirst({
    where: (clusters, { eq }) => eq(clusters.id, clusterId),
  })

  return cluster
}

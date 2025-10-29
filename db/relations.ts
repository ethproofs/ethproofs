import { relations } from "drizzle-orm/relations"
import { authUsers } from "drizzle-orm/supabase"

import {
  apiAuthTokens,
  benchmarks,
  blocks,
  cloudInstances,
  cloudProviders,
  clusterBenchmarks,
  clusterMachines,
  clusters,
  clusterVersions,
  machines,
  proofs,
  recursiveRootProofs,
  teams,
  zkvmPerformanceMetrics,
  zkvms,
  zkvmSecurityMetrics,
  zkvmVersions,
} from "./schema"

export const apiAuthTokensRelations = relations(apiAuthTokens, ({ one }) => ({
  team: one(teams, {
    fields: [apiAuthTokens.team_id],
    references: [teams.id],
  }),
}))

export const usersRelations = relations(authUsers, ({ many }) => ({
  recursive_root_proofs: many(recursiveRootProofs),
  teams: many(teams),
  clusters: many(clusters),
  api_auth_tokens: many(apiAuthTokens),
  proofs: many(proofs),
}))

export const clustersRelations = relations(clusters, ({ one, many }) => ({
  versions: many(clusterVersions),
  team: one(teams, {
    fields: [clusters.team_id],
    references: [teams.id],
  }),
  benchmarks: many(clusterBenchmarks),
}))

export const clusterVersionsRelations = relations(
  clusterVersions,
  ({ one, many }) => ({
    cluster: one(clusters, {
      fields: [clusterVersions.cluster_id],
      references: [clusters.id],
    }),
    zkvm_version: one(zkvmVersions, {
      fields: [clusterVersions.zkvm_version_id],
      references: [zkvmVersions.id],
    }),
    cluster_machines: many(clusterMachines),
    proofs: many(proofs),
  })
)

export const clusterMachinesRelations = relations(
  clusterMachines,
  ({ one }) => ({
    cluster_version: one(clusterVersions, {
      fields: [clusterMachines.cluster_version_id],
      references: [clusterVersions.id],
    }),
    machine: one(machines, {
      fields: [clusterMachines.machine_id],
      references: [machines.id],
    }),
    cloud_instance: one(cloudInstances, {
      fields: [clusterMachines.cloud_instance_id],
      references: [cloudInstances.id],
    }),
  })
)

export const machinesRelations = relations(machines, ({ many }) => ({
  cluster_machines: many(clusterMachines),
}))

export const cloudInstancesRelations = relations(
  cloudInstances,
  ({ one, many }) => ({
    cluster_machines: many(clusterMachines),
    provider: one(cloudProviders, {
      fields: [cloudInstances.provider_id],
      references: [cloudProviders.id],
    }),
  })
)

export const clusterBenchmarksRelations = relations(
  clusterBenchmarks,
  ({ one }) => ({
    cluster: one(clusters, {
      fields: [clusterBenchmarks.cluster_id],
      references: [clusters.id],
    }),
    benchmark: one(benchmarks, {
      fields: [clusterBenchmarks.benchmark_id],
      references: [benchmarks.id],
    }),
  })
)

export const recursiveRootProofsRelations = relations(
  recursiveRootProofs,
  ({ one }) => ({
    block: one(blocks, {
      fields: [recursiveRootProofs.block_number],
      references: [blocks.block_number],
    }),
    team: one(teams, {
      fields: [recursiveRootProofs.team_id],
      references: [teams.id],
    }),
  })
)

export const blocksRelations = relations(blocks, ({ many }) => ({
  recursive_root_proofs: many(recursiveRootProofs),
  proofs: many(proofs),
}))

export const teamsRelations = relations(teams, ({ one }) => ({
  user: one(authUsers, {
    fields: [teams.id],
    references: [authUsers.id],
  }),
}))

export const zkvmsRelations = relations(zkvms, ({ one, many }) => ({
  team: one(teams, {
    fields: [zkvms.team_id],
    references: [teams.id],
  }),
  versions: many(zkvmVersions),
  security_metrics: one(zkvmSecurityMetrics, {
    fields: [zkvms.id],
    references: [zkvmSecurityMetrics.zkvm_id],
  }),
  performance_metrics: one(zkvmPerformanceMetrics, {
    fields: [zkvms.id],
    references: [zkvmPerformanceMetrics.zkvm_id],
  }),
}))

export const zkvmVersionsRelations = relations(zkvmVersions, ({ one }) => ({
  zkvm: one(zkvms, {
    fields: [zkvmVersions.zkvm_id],
    references: [zkvms.id],
  }),
}))

export const proofsRelations = relations(proofs, ({ one }) => ({
  block: one(blocks, {
    fields: [proofs.block_number],
    references: [blocks.block_number],
  }),
  cluster_version: one(clusterVersions, {
    fields: [proofs.cluster_version_id],
    references: [clusterVersions.id],
  }),
  team: one(teams, {
    fields: [proofs.team_id],
    references: [teams.id],
  }),
}))

import { relations } from "drizzle-orm/relations"
import { authUsers } from "drizzle-orm/supabase"

import {
  apiAuthTokens,
  blocks,
  clusters,
  clusterVersions,
  gpuPriceIndex,
  proofs,
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
    proofs: many(proofs),
  })
)

export const blocksRelations = relations(blocks, ({ many }) => ({
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
  gpu_price_index: one(gpuPriceIndex, {
    fields: [proofs.gpu_price_index_id],
    references: [gpuPriceIndex.id],
  }),
}))

export const gpuPriceIndexRelations = relations(gpuPriceIndex, ({ many }) => ({
  proofs: many(proofs),
}))

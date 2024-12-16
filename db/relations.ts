import { relations } from "drizzle-orm/relations"
import {
  clusters,
  clusterConfigurations,
  awsInstancePricing,
  blocks,
  recursiveRootProofs,
  teams,
  apiAuthTokens,
  proofs,
  programs,
} from "./schema"
import { authUsers } from "drizzle-orm/supabase"

export const clusterConfigurationsRelations = relations(
  clusterConfigurations,
  ({ one }) => ({
    cluster: one(clusters, {
      fields: [clusterConfigurations.clusterId],
      references: [clusters.id],
    }),
    awsInstancePricing: one(awsInstancePricing, {
      fields: [clusterConfigurations.instanceTypeId],
      references: [awsInstancePricing.id],
    }),
  })
)

export const clustersRelations = relations(clusters, ({ one, many }) => ({
  clusterConfigurations: many(clusterConfigurations),
  usersInAuth: one(authUsers, {
    fields: [clusters.userId],
    references: [authUsers.id],
  }),
  proofs: many(proofs),
}))

export const awsInstancePricingRelations = relations(
  awsInstancePricing,
  ({ many }) => ({
    clusterConfigurations: many(clusterConfigurations),
  })
)

export const recursiveRootProofsRelations = relations(
  recursiveRootProofs,
  ({ one }) => ({
    block: one(blocks, {
      fields: [recursiveRootProofs.blockNumber],
      references: [blocks.blockNumber],
    }),
    usersInAuth: one(authUsers, {
      fields: [recursiveRootProofs.userId],
      references: [authUsers.id],
    }),
  })
)

export const blocksRelations = relations(blocks, ({ many }) => ({
  recursiveRootProofs: many(recursiveRootProofs),
  proofs: many(proofs),
}))

export const usersInAuthRelations = relations(authUsers, ({ many }) => ({
  recursiveRootProofs: many(recursiveRootProofs),
  teams: many(teams),
  clusters: many(clusters),
  apiAuthTokens: many(apiAuthTokens),
  proofs: many(proofs),
}))

export const teamsRelations = relations(teams, ({ one }) => ({
  usersInAuth: one(authUsers, {
    fields: [teams.userId],
    references: [authUsers.id],
  }),
}))

export const apiAuthTokensRelations = relations(apiAuthTokens, ({ one }) => ({
  usersInAuth: one(authUsers, {
    fields: [apiAuthTokens.userId],
    references: [authUsers.id],
  }),
}))

export const proofsRelations = relations(proofs, ({ one }) => ({
  block: one(blocks, {
    fields: [proofs.blockNumber],
    references: [blocks.blockNumber],
  }),
  cluster: one(clusters, {
    fields: [proofs.clusterId],
    references: [clusters.id],
  }),
  usersInAuth: one(authUsers, {
    fields: [proofs.userId],
    references: [authUsers.id],
  }),
  program: one(programs, {
    fields: [proofs.programId],
    references: [programs.id],
  }),
}))

export const programsRelations = relations(programs, ({ many }) => ({
  proofs: many(proofs),
}))

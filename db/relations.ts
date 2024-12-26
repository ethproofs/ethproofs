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
  proofBinaries,
} from "./schema"
import { authUsers } from "drizzle-orm/supabase"

export const apiAuthTokensRelations = relations(apiAuthTokens, ({ one }) => ({
  user: one(authUsers, {
    fields: [apiAuthTokens.user_id],
    references: [authUsers.id],
  }),
}))

export const usersRelations = relations(authUsers, ({ many }) => ({
  recursive_root_proofs: many(recursiveRootProofs),
  teams: many(teams),
  clusters: many(clusters),
  api_auth_tokens: many(apiAuthTokens),
  proofs: many(proofs),
}))

export const clusterConfigurationsRelations = relations(
  clusterConfigurations,
  ({ one }) => ({
    cluster: one(clusters, {
      fields: [clusterConfigurations.cluster_id],
      references: [clusters.id],
    }),
    aip: one(awsInstancePricing, {
      fields: [clusterConfigurations.instance_type_id],
      references: [awsInstancePricing.id],
    }),
  })
)

export const clustersRelations = relations(clusters, ({ one, many }) => ({
  cc: many(clusterConfigurations),
  user: one(authUsers, {
    fields: [clusters.user_id],
    references: [authUsers.id],
  }),
  proofs: many(proofs),
}))

export const awsInstancePricingRelations = relations(
  awsInstancePricing,
  ({ many }) => ({
    cc: many(clusterConfigurations),
  })
)

export const recursiveRootProofsRelations = relations(
  recursiveRootProofs,
  ({ one }) => ({
    block: one(blocks, {
      fields: [recursiveRootProofs.block_number],
      references: [blocks.block_number],
    }),
    user: one(authUsers, {
      fields: [recursiveRootProofs.user_id],
      references: [authUsers.id],
    }),
  })
)

export const blocksRelations = relations(blocks, ({ many }) => ({
  recursive_root_proofs: many(recursiveRootProofs),
  proofs: many(proofs),
}))

export const teamsRelations = relations(teams, ({ one }) => ({
  user: one(authUsers, {
    fields: [teams.user_id],
    references: [authUsers.id],
  }),
}))

export const proofsRelations = relations(proofs, ({ one }) => ({
  block: one(blocks, {
    fields: [proofs.block_number],
    references: [blocks.block_number],
  }),
  cluster: one(clusters, {
    fields: [proofs.cluster_id],
    references: [clusters.id],
  }),
  user: one(authUsers, {
    fields: [proofs.user_id],
    references: [authUsers.id],
  }),
  program: one(programs, {
    fields: [proofs.program_id],
    references: [programs.id],
  }),
  team: one(teams, {
    fields: [proofs.user_id],
    references: [teams.user_id],
  }),
  proof_binary: one(proofBinaries, {
    fields: [proofs.proof_id],
    references: [proofBinaries.proof_id],
  }),
}))

export const programsRelations = relations(programs, ({ many }) => ({
  proofs: many(proofs),
}))

export const proofBinariesRelations = relations(proofBinaries, ({ one }) => ({
  proof: one(proofs, {
    fields: [proofBinaries.proof_id],
    references: [proofs.proof_id],
  }),
}))

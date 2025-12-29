import z from ".."

import { zkvmVersionSchema } from "./zkvm"

// Schema for the actual database structure
export const clusterVersionSchema = z.object({
  id: z.number(),
  cluster_id: z.string().uuid(),
  index: z.number().int(),
  zkvm_version_id: z.number().int(),
  vk_path: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
})

// Schema for what's returned by the API queries (with relationships)
export const clusterVersionWithRelationsSchema = z.object({
  id: z.number().int(),
  cluster_id: z.string().uuid(),
  index: z.number().int(),
  zkvm_version_id: z.number().int(),
  vk_path: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  cluster: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      team_id: z.string().uuid(),
      hardware_description: z.string().nullable(),
      is_open_source: z.boolean(),
      is_multi_gpu: z.boolean(),
      num_gpus: z.number().int(),
      is_active: z.boolean(),
      software_link: z.string().nullable(),
      created_at: z.string(),
    })
    .optional(),
  zkvm_version: zkvmVersionSchema.optional(),
})

export type ClusterVersionWithRelations = z.infer<
  typeof clusterVersionWithRelationsSchema
>

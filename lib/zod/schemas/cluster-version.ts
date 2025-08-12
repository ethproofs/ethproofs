import z from ".."

import { cloudInstanceSchema } from "./cloud-instance"
import { machineSchema } from "./machine"
import { zkvmVersionSchema } from "./zkvm"

// Schema for the actual database structure
export const clusterVersionSchema = z.object({
  id: z.number(),
  version: z.string(),
  description: z.string().optional(),
  created_at: z.string(),
  cluster_machines: z.array(
    z.object({
      machine_id: z.number(),
      machine_count: z.number().int().positive(),
      machine: machineSchema,
      cloud_instance_id: z.number(),
      cloud_instance_count: z.number().int().positive(),
      cloud_instance: cloudInstanceSchema,
    })
  ),
})

// Schema for what's returned by the API queries (with relationships)
export const clusterVersionWithRelationsSchema = z.object({
  id: z.number().int(),
  cluster_id: z.string().uuid(),
  version: z.string(),
  created_at: z.string(),
  updated_at: z.string().optional(),
  cluster: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      nickname: z.string().optional(),
      created_at: z.string(),
      updated_at: z.string().optional(),
    })
    .optional(),
  zkvm_version: zkvmVersionSchema.optional(),
  cluster_machines: z
    .array(
      z.object({
        id: z.number().int(),
        cluster_version_id: z.number().int(),
        machine_id: z.number().int(),
        cloud_instance_id: z.number().int().optional(),
        created_at: z.string(),
        cloud_instance: z
          .object({
            id: z.number().int(),
            instance_id: z.string(),
            provider_id: z.number().int(),
            region: z.string(),
            instance_type: z.string(),
            created_at: z.string(),
            provider: z
              .object({
                id: z.number().int(),
                name: z.string(),
                created_at: z.string(),
              })
              .optional(),
          })
          .optional(),
        machine: z
          .object({
            id: z.number().int(),
            name: z.string(),
            cpu_count: z.number().int(),
            memory_gb: z.number(),
            created_at: z.string(),
          })
          .optional(),
      })
    )
    .optional(),
})

export type ClusterVersionWithRelations = z.infer<
  typeof clusterVersionWithRelationsSchema
>

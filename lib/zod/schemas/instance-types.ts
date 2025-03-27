import z from ".."

import { providerType } from "@/db/schema"

export const InstanceTypesSchema = z.object({
  id: z.number(),
  provider: z.string(),
  instance_name: z.string(),
  region: z.string(),
  hourly_price: z.number(),
  cpu_arch: z.string(),
  cpu_cores: z.number(),
  cpu_effective_cores: z.number(),
  cpu_name: z.string(),
  memory: z.number(),
  gpu_count: z.number(),
  gpu_arch: z.string(),
  gpu_name: z.string(),
  gpu_memory: z.number(),
  mobo_name: z.string(),
  disk_name: z.string(),
  disk_space: z.number(),
  created_at: z.string(),
  snapshot_date: z.string(),
})

export type InstanceType = z.infer<typeof InstanceTypesSchema>

export const InstanceTypesQuerySchema = z.object({
  provider: z.enum(providerType.enumValues).optional(),
})

export type InstanceTypesQuery = z.infer<typeof InstanceTypesQuerySchema>

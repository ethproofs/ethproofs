import z from ".."

import { providerType } from "@/db/schema"

export const CloudInstancesSchema = z.object({
  id: z.number(),
  provider: z.string(),
  instance_name: z.string(),
  region: z.string(),
  hourly_price: z.number(),
  cpu_arch: z.string().optional(),
  cpu_cores: z.number(),
  cpu_effective_cores: z.number().optional(),
  cpu_name: z.string().optional(),
  memory: z.number(),
  gpu_count: z.number().optional(),
  gpu_arch: z.string().optional(),
  gpu_name: z.string().optional(),
  gpu_memory: z.number().optional(),
  mobo_name: z.string().optional(),
  disk_name: z.string().optional(),
  disk_space: z.number().optional(),
  created_at: z.string(),
  snapshot_date: z.string().optional(),
})

export type CloudInstance = z.infer<typeof CloudInstancesSchema>

export const CloudInstancesQuerySchema = z.object({
  provider: z.enum(providerType.enumValues).optional(),
})

export type CloudInstancesQuery = z.infer<typeof CloudInstancesQuerySchema>

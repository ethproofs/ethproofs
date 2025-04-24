import z from "zod"

import { CloudInstancesSchema } from "./cloud-instance"
import { MachineSchema } from "./machine"

export const ClusterVersionSchema = z.object({
  id: z.number(),
  version: z.string(),
  description: z.string().optional(),
  created_at: z.string(),
  cluster_machines: z.array(
    z.object({
      machine_id: z.number(),
      machine_count: z.number().int().positive(),
      machine: MachineSchema,
      cloud_instance_id: z.number(),
      cloud_instance_count: z.number().int().positive(),
      cloud_instance: CloudInstancesSchema,
    })
  ),
})

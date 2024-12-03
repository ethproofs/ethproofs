import { z } from "zod"

export const machineSchema = z.object({
  machine_name: z.string().max(50),
  machine_description: z.string().max(200).optional(),
  machine_hardware: z.string().max(200).optional(),
  machine_cycle_type: z.string().max(50).optional(),
})

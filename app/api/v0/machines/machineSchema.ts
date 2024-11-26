import { z } from "zod"

export const machineSchema = z.object({
  machine_name: z.string(),
  machine_description: z.string().optional(),
})

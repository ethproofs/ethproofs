import z from ".."

export const MachineSchema = z.object({
  machine_id: z.number(),
  machine_name: z.string(),
  machine_description: z.string().optional(),
  machine_hardware: z.string().optional(),
})

export const createMachineSchema = z.object({
  machine_name: z.string().max(50),
  machine_description: z
    .string()
    .max(200)
    .optional()
    .describe("Machine description"),
  machine_hardware: z
    .string()
    .max(200)
    .optional()
    .describe("Technical details of the machine"),
})

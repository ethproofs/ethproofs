import z from ".."

export const MachineSchema = z.object({
  machine_id: z.number(),
  machine_name: z.string(),
  machine_description: z.string().optional(),
  machine_hardware: z.string().optional(),
})

export const createMachineSchema = z.object({
  machine_name: z
    .string()
    .max(50)
    .describe('Human-readable name (e.g., "ZKnight-01", "SNARK-Sentinel")'),
  machine_description: z
    .string()
    .max(200)
    .optional()
    .describe('Description of the machine (e.g., "Primary RISC-V prover")'),
  machine_hardware: z
    .string()
    .max(200)
    .optional()
    .describe(
      'Technical specifications (e.g., "RISC-V Prover", "STARK-to-SNARK Prover")'
    ),
})

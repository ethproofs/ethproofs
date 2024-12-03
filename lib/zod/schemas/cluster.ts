import z from ".."

export const ClusterSchema = z.object({
  cluster_id: z.number(),
  cluster_name: z.string(),
  cluster_description: z.string().optional(),
  cluster_hardware: z.string().optional(),
})

export const createClusterSchema = z.object({
  cluster_name: z
    .string()
    .max(50)
    .describe('Human-readable name (e.g., "ZKnight-01", "SNARK-Sentinel")'),
  cluster_description: z
    .string()
    .max(200)
    .optional()
    .describe('Description of the machine (e.g., "Primary RISC-V prover")'),
  cluster_hardware: z
    .string()
    .max(200)
    .optional()
    .describe(
      'Technical specifications (e.g., "RISC-V Prover", "STARK-to-SNARK Prover")'
    ),
  cluster_configuration: z
    .array(
      z.object({
        instance_type: z
          .string()
          .describe(
            "Instance type (e.g., 'c5.xlarge'). Check our aws instance pricing endpoint for available instance types"
          ),
        instance_count: z.number().describe("Number of instances of this type"),
      })
    )
    .describe("Cluster configuration"),
})

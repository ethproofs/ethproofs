import z from ".."

export const ClusterSchema = z.object({
  cluster_id: z.number(),
  cluster_name: z.string(),
  cluster_description: z.string().optional(),
  cluster_hardware: z.string().optional(),
  cluster_cycle_type: z.string().optional(),
  cluster_proof_type: z.string().optional(),
})

export const createClusterSchema = z.object({
  cluster_name: z.string().max(50).openapi({
    description: "Human-readable name. Main display name in the UI",
    example: "ZKnight-01",
  }),
  cluster_description: z.string().max(200).optional().openapi({
    description: "Description of the cluster",
    example: "Primary RISC-V prover",
  }),
  cluster_hardware: z.string().max(200).optional().openapi({
    description: "Technical specifications",
    example: "RISC-V Prover",
  }),
  cluster_cycle_type: z.string().max(50).optional().openapi({
    description: "Type of cycle",
    example: "SP1",
  }),
  cluster_proof_type: z.string().max(50).optional().openapi({
    description: "Type of proofs to be generated",
    example: "STARK",
  }),
  cluster_configuration: z
    .array(
      z.object({
        instance_type: z.string().openapi({
          description: "Instance type",
          example: "c5.xlarge",
        }),
        instance_count: z.number().openapi({
          description: "Number of instances of this type",
          example: 10,
        }),
      })
    )
    .describe("Cluster configuration"),
})

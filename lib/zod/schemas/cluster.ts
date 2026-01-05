import z from ".."

export const clusterSchema = z.object({
  id: z.number().nullable(),
  name: z.string(),
  hardware_description: z.string().optional().nullable(),
})

export type Cluster = z.infer<typeof clusterSchema>

const baseClusterSchema = z.object({
  name: z.string().max(50).openapi({
    description: "Human-readable name. Main display name in the UI",
    example: "ZKnight-01",
  }),
  zkvm_version_id: z.number().int().positive().openapi({
    description:
      "ID of the zkVM version. Visit [ZKVMs](/docs/zkvms) to view all available zkVMs and their IDs.",
    example: 1,
  }),
  num_gpus: z.number().int().positive().default(1).openapi({
    description:
      "Number of GPUs in the cluster. Determines if cluster is multi-GPU (>1) or single-GPU (1).",
    example: 8,
  }),
  hardware_description: z.string().max(200).optional().openapi({
    description: "Free-form text description of the cluster's hardware for display in the UI",
    example: "8x NVIDIA H100 80GB GPUs, AMD EPYC 9654 96-Core Processor",
  }),
})

export const createClusterSchema = baseClusterSchema

export const activeClusterIdSchema = z.object({
  id: z.number().openapi({
    description: "Cluster ID (index)",
    example: 1,
  }),
})

export const updateClusterMetadataSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(50).optional(),
  num_gpus: z.number().int().positive().optional(),
  hardware_description: z.string().max(200).optional(),
})

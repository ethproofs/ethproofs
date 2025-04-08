import z from "zod"

export const ClusterMachineSchema = z.object({
  gpu_models: z.array(z.string()).openapi({
    description: "List of GPU models",
    example: ["RTX 4090", "RTX 4080"],
  }),
  memory_gb: z.number().openapi({
    description: "Memory in GB",
    example: 256,
  }),
  memory_specification: z.string().openapi({
    description: "Memory specification",
    example: "8x32GB DDR5-4800 ECC",
  }),
  network_configuration: z.string().openapi({
    description: "Network configuration",
    example: "10Gbps",
  }),
})

export type ClusterMachine = z.infer<typeof ClusterMachineSchema>

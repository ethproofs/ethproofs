import z from "zod"

export const MachineSchema = z.object({
  cpu_model: z.string().openapi({
    description: "CPU model",
    example: "Intel(R) Xeon(R) CPU @ 2.20GHz",
  }),
  cpu_cores: z.number().openapi({
    description: "Number of CPU cores",
    example: 2,
  }),
  gpu_models: z.array(z.string()).openapi({
    description: "List of GPU models",
    example: ["RTX 4090", "RTX 4080"],
  }),
  gpu_count: z.array(z.number()).openapi({
    description: "Number of GPUs",
    example: [1, 1],
  }),
  gpu_memory_gb: z.array(z.number()).openapi({
    description: "GPU memory size in GB",
    example: [24, 24],
  }),
  memory_size_gb: z.array(z.number()).openapi({
    description: "Memory size in GB",
    example: [32, 32],
  }),
  memory_count: z.array(z.number()).openapi({
    description: "Number of memory modules",
    example: [8, 8],
  }),
  memory_type: z.array(z.string()).openapi({
    description: "Memory type",
    example: ["DDR5-4800 ECC", "DDR5-4800 ECC"],
  }),
  storage_size_gb: z.number().openapi({
    description: "Storage size in GB",
    example: 1000,
  }),
  total_tera_flops: z.number().openapi({
    description: "Total Tera Flops",
    example: 1000,
  }),
  network_between_machines: z.string().openapi({
    description: "Network configuration",
    example: "10Gbps",
  }),
})

export type Machine = z.infer<typeof MachineSchema>

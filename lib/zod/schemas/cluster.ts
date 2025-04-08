import z from ".."

import { CloudInstancesSchema } from "./cloud-instance"
import { ClusterMachineSchema } from "./cluster-machine"

export const ClusterSchema = z.object({
  id: z.number().nullable(),
  nickname: z.string(),
  description: z.string().optional().nullable(),
  // DEPRECATED
  hardware: z.string().optional().nullable(),
  cycle_type: z.string().optional().nullable(),
  proof_type: z.string().optional().nullable(),
  cluster_configuration: z.array(
    z.object({
      cluster_machine_id: z.number(),
      cluster_machine_count: z.number().int().positive(),
      cluster_machine: ClusterMachineSchema,
      cloud_instance_id: z.number(),
      cloud_instance_count: z.number().int().positive(),
      cloud_instance: CloudInstancesSchema,
    })
  ),
})

export type Cluster = z.infer<typeof ClusterSchema>

const baseClusterSchema = z.object({
  nickname: z.string().max(50).openapi({
    description: "Human-readable name. Main display name in the UI",
    example: "ZKnight-01",
  }),
  description: z.string().max(200).optional().openapi({
    description: "Description of the cluster",
    example: "Primary RISC-V prover",
  }),
  hardware: z.string().max(200).optional().openapi({
    description:
      "Technical specifications. Use `configuration.cluster_machine` field instead.",
    example: "RISC-V Prover",
    deprecated: true,
  }),
  cycle_type: z.string().max(50).optional().openapi({
    description: "Type of cycle",
    example: "SP1",
  }),
  proof_type: z.string().max(50).optional().openapi({
    description:
      "Proof system used to generate proofs. (e.g., Groth16 or PlonK)",
    example: "Groth16",
  }),
})

export const createClusterSchema = baseClusterSchema.extend({
  configuration: z
    .array(
      z.object({
        cluster_machine: ClusterMachineSchema.openapi({
          description: "Physical hardware specifications of the machine",
          example: {
            gpu_models: ["RTX 4090", "RTX 4080"],
            memory_gb: 256,
            memory_specification: "8x32GB DDR5-4800 ECC",
            network_configuration: "10Gbps",
          },
        }),
        cluster_machine_count: z.number().int().positive().openapi({
          description: "Number of machines of this type",
          example: 1,
        }),
        cloud_instance: z.string().openapi({
          description: "Equivalent cloud instance name",
          example: "c5.xlarge",
        }),
        cloud_instance_count: z.number().int().positive().openapi({
          description: "Number of equivalent cloud instances",
          example: 10,
        }),
      })
    )
    .describe("Cluster configuration"),
})

export const singleMachineSchema = baseClusterSchema.extend({
  cluster_machine: ClusterMachineSchema.openapi({
    description: "Real hardware specifications",
    example: {
      gpu_models: ["RTX 4090", "RTX 4080"],
      memory_gb: 256,
      memory_specification: "8x32GB DDR5-4800 ECC",
      network_configuration: "10Gbps",
    },
  }),
  cloud_instance: z.string().openapi({
    description: "Equivalent cloud instance name",
    example: "c5.xlarge",
  }),
})

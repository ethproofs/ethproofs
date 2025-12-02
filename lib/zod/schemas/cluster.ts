import z from ".."

import { cloudInstanceSchema } from "./cloud-instance"
import { machineSchema } from "./machine"

export const clusterSchema = z.object({
  id: z.number().nullable(),
  nickname: z.string(),
  description: z.string().optional().nullable(),
  // DEPRECATED
  hardware: z.string().optional().nullable(),
  cycle_type: z.string().optional().nullable(),
  proof_type: z.string().optional().nullable(),
  machines: z.array(
    z.object({
      machine: machineSchema,
      machine_count: z.number().int().positive(),
      cloud_instance: cloudInstanceSchema,
      cloud_instance_count: z.number().int().positive(),
    })
  ),
})

export type Cluster = z.infer<typeof clusterSchema>

const baseClusterSchema = z.object({
  nickname: z.string().max(50).openapi({
    description: "Human-readable name. Main display name in the UI",
    example: "ZKnight-01",
  }),
  description: z.string().max(200).optional().openapi({
    description: "Description of the cluster",
    example: "Primary RISC-V prover",
  }),
  zkvm_version_id: z.number().int().positive().openapi({
    description:
      "ID of the zkVM version. Visit [ZKVMs](/docs/zkvms) to view all available zkVMs and their IDs.",
    example: 1,
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
        machine: machineSchema.openapi({
          description: "Physical hardware specifications of the machine",
        }),
        machine_count: z.number().int().positive().openapi({
          description: "Number of machines of this type",
          example: 1,
        }),
        cloud_instance_name: z.string().openapi({
          description:
            "The instance_name value of the cloud instance. Visit [Cloud Instances](/docs/cloud-instances) to view all available instances and their exact names.",
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
  machine: machineSchema.openapi({
    description: "Physical hardware specifications of the machine",
  }),
  cloud_instance_name: z.string().openapi({
    description:
      "The instance_name value of the cloud instance. Visit [Cloud Instances](/docs/cloud-instances) to view all available instances and their exact names.",
    example: "c5.xlarge",
  }),
})

export const activeClusterIdSchema = z.object({
  id: z.number().openapi({
    description: "Cluster ID (index)",
    example: 1,
  }),
})

export const updateClusterSchema = z.object({
  nickname: z.string().max(50).optional().openapi({
    description: "Human-readable name. Main display name in the UI",
    example: "ZKnight-01",
  }),
  description: z.string().max(200).optional().openapi({
    description: "Description of the cluster",
    example: "Primary RISC-V prover",
  }),
  zkvm_version_id: z.number().int().positive().optional().openapi({
    description:
      "ID of the zkVM version. Visit [ZKVMs](/docs/zkvms) to view all available zkVMs and their IDs.",
    example: 1,
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
  configuration: z
    .array(
      z.object({
        machine: machineSchema.openapi({
          description: "Physical hardware specifications of the machine",
        }),
        machine_count: z.number().int().positive().openapi({
          description: "Number of machines of this type",
          example: 1,
        }),
        cloud_instance_name: z.string().openapi({
          description:
            "The instance_name value of the cloud instance. Visit [Cloud Instances](/docs/cloud-instances) to view all available instances and their exact names.",
          example: "c5.xlarge",
        }),
        cloud_instance_count: z.number().int().positive().openapi({
          description: "Number of equivalent cloud instances",
          example: 10,
        }),
      })
    )
    .optional()
    .describe("Updated cluster configuration"),
})

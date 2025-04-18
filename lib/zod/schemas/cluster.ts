import z from ".."

import { CloudInstancesSchema } from "./cloud-instance"
import { MachineSchema } from "./machine"

export const ClusterSchema = z.object({
  id: z.number().nullable(),
  nickname: z.string(),
  description: z.string().optional().nullable(),
  // DEPRECATED
  hardware: z.string().optional().nullable(),
  cycle_type: z.string().optional().nullable(),
  proof_type: z.string().optional().nullable(),
  machines: z.array(
    z.object({
      machine: MachineSchema,
      machine_count: z.number().int().positive(),
      cloud_instance: CloudInstancesSchema,
      cloud_instance_count: z.number().int().positive(),
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
        machine: MachineSchema.openapi({
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
  machine: MachineSchema.openapi({
    description: "Physical hardware specifications of the machine",
  }),
  cloud_instance_name: z.string().openapi({
    description:
      "The instance_name value of the cloud instance. Visit [Cloud Instances](/docs/cloud-instances) to view all available instances and their exact names.",
    example: "c5.xlarge",
  }),
})

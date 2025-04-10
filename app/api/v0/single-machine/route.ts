import { ZodError } from "zod"

import { db } from "@/db"
import { clusterConfigurations, clusterMachines, clusters } from "@/db/schema"
import { withAuth } from "@/lib/middleware/with-auth"
import { singleMachineSchema } from "@/lib/zod/schemas/cluster"

export const POST = withAuth(async ({ request, user }) => {
  const requestBody = await request.json()

  // validate payload schema
  let singleMachinePayload
  try {
    singleMachinePayload = singleMachineSchema.parse(requestBody)
  } catch (error) {
    console.error("single machine payload invalid", error)
    if (error instanceof ZodError) {
      return new Response(`Invalid payload: ${error.message}`, {
        status: 400,
      })
    }

    return new Response("Invalid payload", {
      status: 400,
    })
  }

  const {
    nickname,
    description,
    hardware,
    cycle_type,
    proof_type,
    cloud_instance,
    cluster_machine,
  } = singleMachinePayload

  // get & validate cloud instance id
  const cloudInstance = await db.query.cloudInstances.findFirst({
    columns: {
      id: true,
      instance_name: true,
    },
    where: (cloudInstances, { eq }) =>
      eq(cloudInstances.instance_name, cloud_instance),
  })

  if (!cloudInstance) {
    return new Response("Cloud instance not found", { status: 400 })
  }

  let clusterIndex: number | null = null
  await db.transaction(async (tx) => {
    // create cluster for single machine
    const [cluster] = await tx
      .insert(clusters)
      .values({
        nickname,
        description,
        hardware,
        cycle_type,
        proof_type,
        team_id: user.id,
      })
      .returning({ id: clusters.id, index: clusters.index })

    // create cluster machines
    const [clusterMachine] = await tx
      .insert(clusterMachines)
      .values({
        cpu_model: cluster_machine.cpu_model,
        cpu_cores: cluster_machine.cpu_cores,
        gpu_models: cluster_machine.gpu_models,
        gpu_count: cluster_machine.gpu_count,
        memory_size_gb: cluster_machine.memory_size_gb,
        memory_count: cluster_machine.memory_count,
        memory_type: cluster_machine.memory_type,
        storage_size_gb: cluster_machine.storage_size_gb,
        total_tera_flops: cluster_machine.total_tera_flops,
        network_between_machines: cluster_machine.network_between_machines,
      })
      .returning({ id: clusterMachines.id })

    // create single machine as a cluster with 1 instance
    await tx.insert(clusterConfigurations).values({
      cluster_id: cluster.id,
      cluster_machine_id: clusterMachine.id,
      cluster_machine_count: 1,
      cloud_instance_id: cloudInstance.id,
      cloud_instance_count: 1,
    })

    clusterIndex = cluster.index
  })

  return Response.json({ id: clusterIndex })
})

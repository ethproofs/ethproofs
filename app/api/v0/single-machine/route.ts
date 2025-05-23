import { ZodError } from "zod"

import { db } from "@/db"
import {
  clusterMachines,
  clusters,
  clusterVersions,
  machines,
} from "@/db/schema"
import { getZkvmVersion } from "@/lib/api/zkvm-versions"
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
    zkvm_version_id,
    hardware,
    cycle_type,
    proof_type,
    cloud_instance_name,
    machine,
  } = singleMachinePayload

  // get & validate cloud instance id
  const cloudInstance = await db.query.cloudInstances.findFirst({
    columns: {
      id: true,
      instance_name: true,
    },
    where: (cloudInstances, { eq }) =>
      eq(cloudInstances.instance_name, cloud_instance_name),
  })

  if (!cloudInstance) {
    return new Response("Cloud instance not found", { status: 400 })
  }

  // validate zkvm_version_id
  const zkvmVersion = await getZkvmVersion(zkvm_version_id)

  if (!zkvmVersion) {
    return new Response("Invalid zkvm version", { status: 400 })
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
        is_multi_machine: false,
        team_id: user.id,
      })
      .returning({ id: clusters.id, index: clusters.index })

    // create cluster version
    const [clusterVersion] = await tx
      .insert(clusterVersions)
      .values({
        cluster_id: cluster.id,
        zkvm_version_id,
        // TODO: remove this once we have a real version management system for users
        version: "v0.1",
      })
      .returning({ id: clusterVersions.id })

    // create machine
    const [createdMachine] = await tx
      .insert(machines)
      .values(machine)
      .returning({ id: machines.id })

    // create single machine as a cluster with 1 instance
    await tx.insert(clusterMachines).values({
      cluster_version_id: clusterVersion.id,
      machine_id: createdMachine.id,
      machine_count: 1,
      cloud_instance_id: cloudInstance.id,
      cloud_instance_count: 1,
    })

    clusterIndex = cluster.index
  })

  return Response.json({ id: clusterIndex })
})

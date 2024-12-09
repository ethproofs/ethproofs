import { withAuth } from "@/lib/auth"
import { singleMachineSchema } from "@/lib/zod/schemas/cluster"

export const POST = withAuth(async ({ request, client, user }) => {
  const requestBody = await request.json()

  if (!user) {
    return new Response("Invalid API key", {
      status: 401,
    })
  }

  // validate payload schema
  let singleMachinePayload
  try {
    singleMachinePayload = singleMachineSchema.parse(requestBody)
  } catch (error) {
    console.error("single machine payload invalid", error)
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
    instance_type,
  } = singleMachinePayload

  // get & validate instance type id
  const { data: instanceType, error: instanceTypeError } = await client
    .from("aws_instance_pricing")
    .select("id, instance_type")
    .eq("instance_type", instance_type)
    .single()

  if (instanceTypeError) {
    console.error("error fetching instance type ids", instanceTypeError)
    return new Response("Internal server error", { status: 500 })
  }

  // create cluster for single machine
  const { data, error } = await client
    .from("clusters")
    .insert({
      nickname,
      description,
      hardware,
      cycle_type,
      proof_type,
      user_id: user.id,
    })
    .select("id, index")
    .single()

  if (error) {
    console.error("error creating cluster", error)
    return new Response("Internal server error", { status: 500 })
  }

  // create cluster configuration for single machine
  const { error: clusterConfigurationError } = await client
    .from("cluster_configurations")
    .insert({
      cluster_id: data.id,
      instance_type_id: instanceType.id,
      instance_count: 1,
    })

  if (clusterConfigurationError) {
    console.error(
      "error creating cluster configuration",
      clusterConfigurationError
    )
    return new Response("Internal server error", { status: 500 })
  }

  return Response.json({ id: data.index })
})

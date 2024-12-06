import { withAuth } from "@/lib/auth"
import { createClusterSchema } from "@/lib/zod/schemas/cluster"

export const GET = withAuth(async ({ client, user }) => {
  if (!user) {
    return new Response("Invalid API key", {
      status: 401,
    })
  }

  const { data, error } = await client
    .from("clusters")
    .select("index, nickname, description, hardware, cycle_type, proof_type")
    .eq("user_id", user.id)

  if (error) {
    console.error("error fetching clusters", error)
    return new Response("Internal server error", { status: 500 })
  }

  return Response.json(data)
})

export const POST = withAuth(async ({ request, client, user }) => {
  const requestBody = await request.json()

  if (!user) {
    return new Response("Invalid API key", {
      status: 401,
    })
  }

  // validate payload schema
  let clusterPayload
  try {
    clusterPayload = createClusterSchema.parse(requestBody)
  } catch (error) {
    console.error("cluster payload invalid", error)
    return new Response("Invalid payload", {
      status: 400,
    })
  }

  const {
    nickname,
    description,
    hardware,
    configuration,
    cycle_type,
    proof_type,
  } = clusterPayload

  // get & validate instance type ids
  const { data: instanceTypeIds, error: instanceTypeError } = await client
    .from("aws_instance_pricing")
    .select("id, instance_type")
    .in(
      "instance_type",
      configuration.map((config) => config.instance_type)
    )

  if (instanceTypeError) {
    console.error("error fetching instance type ids", instanceTypeError)
    return new Response("Internal server error", { status: 500 })
  }

  if (instanceTypeIds.length !== configuration.length) {
    return new Response("Invalid cluster configuration", { status: 400 })
  }

  // create cluster
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

  // create cluster configuration
  const instanceTypeById = instanceTypeIds.reduce(
    (acc, instanceType) => {
      acc[instanceType.instance_type] = instanceType.id
      return acc
    },
    {} as Record<string, number>
  )

  const { error: clusterConfigurationError } = await client
    .from("cluster_configurations")
    .insert(
      configuration.map(({ instance_type, instance_count }) => ({
        cluster_id: data.id,
        instance_type_id: instanceTypeById[instance_type],
        instance_count,
      }))
    )

  if (clusterConfigurationError) {
    console.error(
      "error creating cluster configuration",
      clusterConfigurationError
    )
    return new Response("Internal server error", { status: 500 })
  }

  return Response.json({ index: data.index })
})

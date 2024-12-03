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
    .select("cluster_id, cluster_name, cluster_description, cluster_hardware")
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
  try {
    createClusterSchema.parse(requestBody)
  } catch (error) {
    console.error("cluster payload invalid", error)
    return new Response("Invalid payload", {
      status: 400,
    })
  }

  const { cluster_name, cluster_description, cluster_hardware } = requestBody

  const { data, error } = await client
    .from("clusters")
    .insert({
      cluster_name,
      cluster_description,
      cluster_hardware,
      user_id: user.id,
    })
    .select("cluster_id")
    .single()

  if (error) {
    console.error("error creating cluster", error)
    return new Response("Internal server error", { status: 500 })
  }

  return Response.json(data)
})

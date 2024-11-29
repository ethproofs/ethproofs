import { withAuth } from "@/lib/auth"
import { createMachineSchema } from "@/lib/zod/schemas/machine"

export const GET = withAuth(async ({ client, user }) => {
  if (!user) {
    return new Response("Invalid API key", {
      status: 401,
    })
  }

  const { data, error } = await client
    .from("prover_machines")
    .select("machine_id, machine_name, machine_description, machine_hardware")
    .eq("user_id", user.id)

  if (error) {
    console.error("error fetching machines", error)
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
    createMachineSchema.parse(requestBody)
  } catch (error) {
    console.error("machine payload invalid", error)
    return new Response("Invalid payload", {
      status: 400,
    })
  }

  const { machine_name, machine_description, machine_hardware } = requestBody

  const { data, error } = await client
    .from("prover_machines")
    .insert({
      machine_name,
      machine_description,
      machine_hardware,
      user_id: user.id,
    })
    .select("machine_id")
    .single()

  if (error) {
    console.error("error creating machine", error)
    return new Response("Internal server error", { status: 500 })
  }

  return Response.json(data)
})

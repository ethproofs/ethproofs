import { AwsInstancePricing } from "@/lib/zod/schemas/aws-instance-pricing"
import { createClient } from "@/utils/supabase/server"

export const GET = async () => {
  const client = createClient()

  const { data, error } = await client.from("aws_instance_pricing").select()

  if (error) {
    console.error("error fetching aws pricing list", error)
    return new Response("Internal server error", { status: 500 })
  }

  return Response.json(data satisfies AwsInstancePricing[])
}

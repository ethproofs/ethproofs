import { createClient } from "@/utils/supabase/server"

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params

  const client = createClient()

  const { data, error } = await client
    .from("proofs")
    .select("block_number, cluster_id, user_id")
    .eq("proof_id", id)
    .single()

  const { data: binaryData, error: binaryError } = await client
    .from("proof_binaries")
    .select("proof_binary")
    .eq("proof_id", id)
    .single()

  if (error || binaryError || !binaryData.proof_binary) {
    console.error(error)
    return new Response("No proof found", { status: 404 })
  }

  const { data: team } = await client
    .from("teams")
    .select("team_name")
    .eq("user_id", data.user_id)
    .single()

  const teamName = team?.team_name
    ? team.team_name
    : data.cluster_id.split("-")[0]
  const filename = `${data.block_number}_${teamName}_${id}.bin`

  const binaryBuffer = Buffer.from(binaryData.proof_binary.slice(2), "hex")
  const blob = new Blob([binaryBuffer], {
    type: "application/octet-stream",
  })

  return new Response(blob, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}

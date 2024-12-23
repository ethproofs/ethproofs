import { createClient } from "@/utils/supabase/server"

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params

  const client = createClient()

  const { data, error } = await client
    .from("proofs")
    .select(
      "block_number, cluster_id, user_id, proof_binaries!inner(proof_binary)"
    )
    .eq("proof_id", id)
    .single()

  if (error) {
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

  const binaryBuffer = Buffer.from(
    data.proof_binaries.proof_binary.slice(2),
    "hex"
  )
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

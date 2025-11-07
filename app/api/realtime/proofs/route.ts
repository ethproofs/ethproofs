import { fetchAllProofsForRealtime } from "@/lib/api/proofs"

export async function GET() {
  try {
    const proofs = await fetchAllProofsForRealtime()

    return Response.json({
      proofs,
    })
  } catch (error) {
    console.error("Error fetching realtime proofs", error)
    return new Response("Internal server error", { status: 500 })
  }
}

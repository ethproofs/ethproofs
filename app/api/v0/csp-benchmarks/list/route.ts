import { listCspBenchmarks } from "@/lib/api/csp-benchmarks"

export async function GET() {
  const files = await listCspBenchmarks()

  if (!files) {
    return new Response("Failed to list benchmark files", { status: 500 })
  }

  return new Response(JSON.stringify(files), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  })
}

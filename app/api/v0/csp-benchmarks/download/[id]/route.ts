import { downloadCspBenchmarks } from "@/lib/api/csp-benchmarks"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id) {
    return new Response("No filename provided", { status: 400 })
  }

  const filename = `${id}.json`
  const blob = await downloadCspBenchmarks(filename)

  if (!blob) {
    return new Response("Benchmarks file not found", { status: 404 })
  }

  const arrayBuffer = await blob.arrayBuffer()

  return new Response(arrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  })
}

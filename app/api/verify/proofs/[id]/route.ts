import { downloadBinaryForProofId, getProofData } from "@/lib/api/proofs"
import { isVerifiableProver } from "@/lib/provers"
import { verifyProofServer } from "@/lib/server/verify-service"
import { getCachedVk } from "@/lib/server/vk-cache"

function sendSseEvent(
  encoder: TextEncoder,
  controller: ReadableStreamDefaultController<Uint8Array>,
  status: string,
  data?: Record<string, unknown>
) {
  const message = {
    status,
    ...data,
    timestamp: new Date().toISOString(),
  }
  const encoded = encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
  controller.enqueue(encoded)
}

function createVerificationStream(proofId: number, proofIdStr: string) {
  return new ReadableStream(
    {
      async start(controller) {
        const encoder = new TextEncoder()

        try {
          // Send downloading status while fetching proof data and binaries
          sendSseEvent(encoder, controller, "downloading")
          const proofData = await getProofData(proofIdStr)

          if (proofData.proof_status !== "proved") {
            sendSseEvent(encoder, controller, "error", {
              error: `Proof status is ${proofData.proof_status}, not proved`,
            })
            controller.close()
            return
          }

          // Check if this prover is verifiable
          if (!isVerifiableProver(proofData.cluster_id)) {
            sendSseEvent(encoder, controller, "complete", {
              isValid: null,
              error: `Verification not yet available: (${proofData.cluster_id})`,
            })
            controller.close()
            return
          }

          // Download proof and vk
          const { arrayBuffer } = await downloadBinaryForProofId(
            proofId,
            proofData
          )
          const proofBytes = new Uint8Array(arrayBuffer)
          let vkBytes: Uint8Array | null = null
          try {
            vkBytes = await getCachedVk(
              proofData.proof_id,
              proofData.cluster_id
            )
          } catch (err) {
            const errorMsg =
              err instanceof Error ? err.message : "Unknown error"
            sendSseEvent(encoder, controller, "complete", {
              isValid: null,
              error: `vk not available: ${errorMsg}`,
            })
            controller.close()
            return
          }

          // Send verifying status
          sendSseEvent(encoder, controller, "verifying")
          const result = await verifyProofServer(
            proofData.cluster_id,
            proofBytes,
            vkBytes
          )

          // Send result
          sendSseEvent(encoder, controller, "complete", {
            isValid: result.isValid,
            error: result.error,
            verifyTime: result.verifyTime,
          })

          controller.close()
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Unknown error"
          sendSseEvent(encoder, controller, "error", {
            error: errorMessage,
          })
          controller.close()
        }
      },
    },
    {
      highWaterMark: 1,
    }
  )
}

function createStreamResponse(stream: ReadableStream<Uint8Array>) {
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const proofId = parseInt(id)
  const stream = createVerificationStream(proofId, id)
  return createStreamResponse(stream)
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const proofId = parseInt(id)
  const stream = createVerificationStream(proofId, id)
  return createStreamResponse(stream)
}

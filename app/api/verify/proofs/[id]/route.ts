import { downloadBinaryForProofId, getProofData } from "@/lib/api/proofs"
import { verifyProofServer } from "@/lib/server/verify-service"
import { getCachedVk } from "@/lib/server/vk-cache"
import { isVerifiableZkvm } from "@/lib/zkvm-verifiers"

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

          // Check if proof's cluster_version is active and has necessary data
          if (!proofData.cluster_version) {
            sendSseEvent(encoder, controller, "complete", {
              isValid: null,
              error: `Proof cluster version not found`,
            })
            controller.close()
            return
          }

          if (!proofData.cluster_version.is_active) {
            sendSseEvent(encoder, controller, "complete", {
              isValid: null,
              error: `Proof's cluster version is no longer active (verification disabled)`,
            })
            controller.close()
            return
          }

          if (!proofData.cluster_version.vk_path) {
            sendSseEvent(encoder, controller, "complete", {
              isValid: null,
              error: `Verification key not available for this proof`,
            })
            controller.close()
            return
          }

          const zkvmSlug = proofData.cluster_version.zkvm_version.zkvm.slug
          if (!isVerifiableZkvm(zkvmSlug)) {
            sendSseEvent(encoder, controller, "complete", {
              isValid: null,
              error: `Unsupported zkVM: ${zkvmSlug}`,
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
            const versionIndex = proofData.cluster_version.index ?? 0
            vkBytes = await getCachedVk(
              proofData.proof_id,
              proofData.cluster_id,
              versionIndex
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
          const result = await verifyProofServer(zkvmSlug, proofBytes, vkBytes)

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

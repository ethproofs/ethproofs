import { logger } from "../logger"
import { proofUploadDuration } from "../otel-metrics"

import { PROOF_BINARY_BUCKET } from "@/lib/constants"

import { createClient } from "@/utils/supabase/server"

export const uploadProofBinary = async (
  filename: string,
  binaryBuffer: Buffer
) => {
  const supabase = await createClient()

  const startTime = Date.now()

  const { data, error } = await supabase.storage
    .from(PROOF_BINARY_BUCKET)
    .upload(filename, binaryBuffer, {
      contentType: "application/octet-stream",
      upsert: true,
    })

  const duration = Date.now() - startTime

  if (error) {
    proofUploadDuration.record(duration, { success: "false" })
    logger.error("Failed to upload proof binary", error, {
      filename,
      size_bytes: binaryBuffer.byteLength,
    })
    throw error
  }

  proofUploadDuration.record(duration, { success: "true" })
  logger.debug("Proof binary uploaded", {
    filename,
    size_bytes: binaryBuffer.byteLength,
  })
}

export const getProofBinary = async (filename: string) => {
  const supabase = await createClient()

  const { data } = supabase.storage
    .from(PROOF_BINARY_BUCKET)
    .getPublicUrl(filename)

  return data
}

export const downloadProofBinary = async (filename: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from(PROOF_BINARY_BUCKET)
    .download(filename)

  if (error) {
    logger.error("Failed to download proof binary", error, { filename })
    return null
  }

  logger.debug("Proof binary downloaded", {
    filename,
    size_bytes: data.size,
  })

  return data
}

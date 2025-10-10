import { PROOF_BINARY_BUCKET } from "@/lib/constants"

import { logger } from "../logger"
import { proofUploadDuration } from "../otel-metrics"

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
    logger.error({
      error,
      data,
      filename,
      size_bytes: binaryBuffer.byteLength,
    }, "Failed to upload proof binary")
    throw error
  }

  proofUploadDuration.record(duration, { success: "true" })
  logger.debug({
    data,
    filename,
    size_bytes: binaryBuffer.byteLength,
  }, "Proof binary uploaded")
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
    logger.error({ error, filename }, "Failed to download proof binary")
    return null
  }

  logger.debug({
    filename,
    size_bytes: data.size,
  }, "Proof binary downloaded")

  return data
}

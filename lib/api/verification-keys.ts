import { VERIFICATION_KEYS_BUCKET } from "../constants"
import { logger } from "../logger"

import { createClient } from "@/utils/supabase/server"

export const downloadVerificationKey = async (filename: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from(VERIFICATION_KEYS_BUCKET)
    .download(filename)

  if (error) {
    logger.error("Failed to download verification key", error, { filename })
    return null
  }

  logger.debug("Verification key downloaded", {
    filename,
    size_bytes: data.size,
  })

  return data
}

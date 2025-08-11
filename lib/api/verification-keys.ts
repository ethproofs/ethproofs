import { VERIFICATION_KEYS_BUCKET } from "../constants"

import { createClient } from "@/utils/supabase/server"

export const downloadVerificationKey = async (filename: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from(VERIFICATION_KEYS_BUCKET)
    .download(filename)

  if (error) {
    console.error(`Error downloading ${filename}:`, error)
    return null
  }

  console.log("downloaded vk binary", data)

  return data
}

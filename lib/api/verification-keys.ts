import { createClient as createAdminClient } from "@supabase/supabase-js"

import { VERIFICATION_KEYS_BUCKET } from "../constants"

import { createClient } from "@/utils/supabase/server"

// Create an admin client for storage operations
const getAdminClient = () => {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )
}

export const uploadVerificationKey = async (
  filename: string,
  buffer: Buffer
) => {
  const supabase = getAdminClient()

  const { data, error } = await supabase.storage
    .from(VERIFICATION_KEYS_BUCKET)
    .upload(filename, buffer, {
      contentType: "application/octet-stream",
      upsert: true,
    })

  if (error) {
    console.error(`Error uploading ${filename}:`, error)
    return null
  }

  return data
}

export const downloadVerificationKey = async (filename: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from(VERIFICATION_KEYS_BUCKET)
    .download(filename)

  if (error) {
    console.error(`Error downloading ${filename}:`, error)
    return null
  }

  return data
}

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

export async function downloadMultiPartVerificationKey(
  baseFilename: string
): Promise<Blob | null> {
  const stem = baseFilename.replace(/\.bin$/, "")
  const part0 = await downloadVerificationKey(`${stem}_0.bin`)
  const part1 = await downloadVerificationKey(`${stem}_1.bin`)

  if (!part0 || !part1) return null

  const buf0 = await part0.arrayBuffer()
  const buf1 = await part1.arrayBuffer()
  const combined = new Uint8Array(buf0.byteLength + buf1.byteLength)
  combined.set(new Uint8Array(buf0), 0)
  combined.set(new Uint8Array(buf1), buf0.byteLength)

  return new Blob([combined], { type: "application/octet-stream" })
}

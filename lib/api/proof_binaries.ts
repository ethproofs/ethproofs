import { PROOF_BINARY_BUCKET } from "@/lib/constants"

import { createClient } from "@/utils/supabase/server"

export const uploadProofBinary = async (
  filename: string,
  binaryBuffer: Buffer
) => {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from(PROOF_BINARY_BUCKET)
    .upload(filename, binaryBuffer, {
      contentType: "application/octet-stream",
      upsert: true,
    })

  if (error) {
    console.error("error uploading proof binary", error)
    throw error
  } else {
    console.log("proof binary uploaded", data)
  }
}

export const getProofBinary = async (filename: string) => {
  const supabase = createClient()

  const { data } = supabase.storage
    .from(PROOF_BINARY_BUCKET)
    .getPublicUrl(filename)

  return data
}

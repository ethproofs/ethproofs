import { CSP_BENCHMARKS_BUCKET } from "../constants"

import { createClient } from "@/utils/supabase/server"

export const uploadCspBenchmarks = async (
  filename: string,
  buffer: Buffer
) => {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from(CSP_BENCHMARKS_BUCKET)
    .upload(filename, buffer, {
      contentType: "application/json",
      upsert: true,
    })

  if (error) {
    console.error(`Error uploading ${filename}:`, error)
    return null
  }

  console.log("uploaded csp-benchmarks json", data)

  return data
}

export const downloadCspBenchmarks = async (filename: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from(CSP_BENCHMARKS_BUCKET)
    .download(filename)

  if (error) {
    console.error(`Error downloading ${filename}:`, error)
    return null
  }

  console.log("downloaded csp-benchmarks json", data)

  return data
}

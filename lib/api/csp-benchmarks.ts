import { CSP_BENCHMARKS_BUCKET } from "../constants"

import { createClient } from "@/utils/supabase/server"

export const uploadCspBenchmarks = async (filename: string, buffer: Buffer) => {
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

export const listCspBenchmarks = async () => {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from(CSP_BENCHMARKS_BUCKET)
    .list()

  if (error) {
    console.error("Error listing csp-benchmarks:", error)
    return null
  }

  console.log("listed csp-benchmarks", data)

  return data
}

export const fetchAllCspBenchmarks = async () => {
  const files = await listCspBenchmarks()

  if (!files) return []

  const jsonFiles = files.filter((file) => file.name.endsWith(".json"))

  const benchmarks = await Promise.all(
    jsonFiles.map(async (file) => {
      const blob = await downloadCspBenchmarks(file.name)
      if (!blob) return null

      try {
        const text = await blob.text()
        const data = JSON.parse(text)
        return {
          filename: file.name,
          benchmarkId: file.name.replace(".json", ""),
          updatedAt: file.updated_at || file.created_at,
          data,
        }
      } catch (error) {
        console.error(`Error parsing ${file.name}:`, error)
        return null
      }
    })
  )

  // Filter out nulls
  return benchmarks.filter((b): b is NonNullable<typeof b> => b !== null)
}

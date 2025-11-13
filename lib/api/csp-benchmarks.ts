import { z } from "zod"

import { CSP_BENCHMARKS_BUCKET } from "../constants"

import { createClient } from "@/utils/supabase/server"

export const cspBenchmarkDataSchema = z
  .object({
    name: z.string(),
    feat: z.string().optional(),
    is_zkvm: z.boolean(),
    target: z.string(),
    input_size: z.number().int(),
    proof_duration: z.number().int(), // nanoseconds
    witgen_duration: z.number().int().optional(), // nanoseconds
    verify_duration: z.number().int(), // nanoseconds
    proof_size: z.number().int(), // bytes
    preprocessing_size: z.number().int(), // bytes
    peak_memory: z.number().int(), // bytes
    peak_memory_witgen: z.number().int().optional(), // bytes
    n_constraints: z.number().int(),
    is_maintained: z.boolean(),
    is_zk: z.boolean(),
    is_audited: z.boolean(),
    proving_system: z.string(),
    field_curve: z.string(),
    iop: z.string(),
    pcs: z.string().optional(),
    arithm: z.string().optional(),
    security_bits: z.number().int(),
    cycles: z.number().int().optional(), // cycles
    isa: z.string().optional(),
  })
  .passthrough() // possibly remove with validation

export type CspCollectedBenchmark = z.infer<typeof cspBenchmarkDataSchema>

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

export interface CspCollectedBenchmarks {
  benchmarksId: string
  filename: string
  updatedAt: string | null
  data: CspCollectedBenchmark[]
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
        const rawData = JSON.parse(text)

        const cspCollectedBenchmarks: CspCollectedBenchmarks = {
          filename: file.name,
          benchmarksId: file.name.replace(".json", ""),
          updatedAt: file.updated_at || file.created_at,
          data: rawData as CspCollectedBenchmark[],
        }

        return cspCollectedBenchmarks
      } catch (error) {
        console.error(`Error parsing ${file.name}:`, error)
        return null
      }
    })
  )

  // Filter out nulls
  return benchmarks.filter((b): b is NonNullable<typeof b> => b !== null)
}

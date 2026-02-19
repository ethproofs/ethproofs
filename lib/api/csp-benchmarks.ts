import { unstable_cache as cache } from "next/cache"
import { z } from "zod"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

import { CSP_BENCHMARKS_BUCKET, TAGS } from "../constants"

import { createClient } from "@/utils/supabase/server"

function createStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return null

  return createSupabaseClient(url, key)
}

const benchPropertiesSchema = z.object({
  proving_system: z.string().optional(),
  field_curve: z.string().optional(),
  iop: z.string().optional(),
  pcs: z.string().optional(),
  arithm: z.string().optional(),
  is_zk: z.boolean().optional(),
  security_bits: z.number().int().optional(),
  is_pq: z.boolean().optional(),
  is_maintained: z.boolean().optional(),
  is_audited: z
    .enum(["audited", "not_audited", "partially_audited"])
    .optional(),
  isa: z.string().optional(),
})

const systemPropertiesSchema = benchPropertiesSchema.extend({
  is_zkvm: z.boolean(),
})

const measurementSchema = z.object({
  system: z.string(),
  target: z.string(),
  input_size: z.number().int(),
  proof_duration: z.number().int(),
  verify_duration: z.number().int(),
  cycles: z.number().int().optional(),
  proof_size: z.number().int(),
  preprocessing_size: z.number().int(),
  num_constraints: z.number().int(),
  peak_memory: z.number().int(),
  feat: z.string().optional(),
})

const collectedBenchmarkSchema = z.object({
  metadata: z.object({
    timestamp: z.string(),
    commit_sha: z.string(),
    workflow_run_url: z.string().optional(),
    artifact_urls: z.array(z.string()).optional(),
  }),
  systems: z.record(z.string(), systemPropertiesSchema),
  measurements: z.array(measurementSchema),
})

type CollectedBenchmarks = z.infer<typeof collectedBenchmarkSchema>

function flattenCollectedBenchmarks(collected: CollectedBenchmarks): Metrics[] {
  return collected.measurements.flatMap((m) => {
    const sys = collected.systems[m.system]
    if (!sys) return []

    return [
      {
        name: m.system,
        feat: m.feat,
        is_zkvm: sys.is_zkvm,
        target: m.target,
        input_size: m.input_size,
        proof_duration: m.proof_duration,
        verify_duration: m.verify_duration,
        cycles: m.cycles,
        proof_size: m.proof_size,
        preprocessing_size: m.preprocessing_size,
        num_constraints: m.num_constraints,
        peak_memory: m.peak_memory,
        proving_system: sys.proving_system,
        field_curve: sys.field_curve,
        iop: sys.iop,
        pcs: sys.pcs,
        arithm: sys.arithm,
        is_zk: sys.is_zk,
        security_bits: sys.security_bits,
        is_pq: sys.is_pq,
        is_maintained: sys.is_maintained,
        is_audited: sys.is_audited,
        isa: sys.isa,
      },
    ]
  })
}

export const metricsSchema = measurementSchema
  .omit({ system: true })
  .extend({
    name: z.string(),
    is_zkvm: z.boolean(),
  })
  .merge(benchPropertiesSchema)

export type Metrics = z.infer<typeof metricsSchema>

export interface BenchmarkCollection {
  benchmarksId: string
  filename: string
  updatedAt: string | null
  data: Metrics[]
}

export interface CspBenchmarksResult {
  benchmarks: BenchmarkCollection[]
  failedCount: number
}

export async function uploadCspBenchmarks(filename: string, buffer: Buffer) {
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

  return data
}

export async function downloadCspBenchmarks(filename: string) {
  const supabase = createStorageClient()
  if (!supabase) return null

  const { data, error } = await supabase.storage
    .from(CSP_BENCHMARKS_BUCKET)
    .download(filename)

  if (error) {
    console.error(`Error downloading ${filename}:`, error)
    return null
  }

  return data
}

export async function listCspBenchmarks() {
  const supabase = createStorageClient()
  if (!supabase) return null

  const { data, error } = await supabase.storage
    .from(CSP_BENCHMARKS_BUCKET)
    .list()

  if (error) {
    console.error("Error listing csp-benchmarks:", error)
    return null
  }

  return data
}

async function fetchAllCspBenchmarksUncached(): Promise<CspBenchmarksResult> {
  const files = await listCspBenchmarks()

  if (!files) return { benchmarks: [], failedCount: 0 }

  const jsonFiles = files.filter((file) => file.name.endsWith(".json"))

  const results = await Promise.all(
    jsonFiles.map(async (file) => {
      const blob = await downloadCspBenchmarks(file.name)
      if (!blob) return null

      try {
        const text = await blob.text()
        const rawData: unknown = JSON.parse(text)

        const structuredResult = collectedBenchmarkSchema.safeParse(rawData)
        const flatResult = structuredResult.success
          ? null
          : z.array(metricsSchema).safeParse(rawData)

        let validatedData: Metrics[]
        if (structuredResult.success) {
          validatedData = flattenCollectedBenchmarks(structuredResult.data)
        } else if (flatResult?.success) {
          validatedData = flatResult.data
        } else {
          console.error(
            `Failed to parse ${file.name}:`,
            structuredResult.error.issues.slice(0, 3)
          )
          return null
        }

        const collection: BenchmarkCollection = {
          filename: file.name,
          benchmarksId: file.name.replace(".json", ""),
          updatedAt: file.updated_at || file.created_at,
          data: validatedData,
        }

        return collection
      } catch (error) {
        console.error(`Error parsing or validating ${file.name}:`, error)
        return null
      }
    })
  )

  const benchmarks = results.filter(
    (b): b is NonNullable<typeof b> => b !== null
  )
  const failedCount = results.length - benchmarks.length

  return { benchmarks, failedCount }
}

export const fetchAllCspBenchmarks = cache(
  fetchAllCspBenchmarksUncached,
  ["csp-benchmarks"],
  { revalidate: 60 * 60, tags: [TAGS.CSP_BENCHMARKS] }
)

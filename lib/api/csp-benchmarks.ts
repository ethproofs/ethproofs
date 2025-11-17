import { z } from "zod"

import { CSP_BENCHMARKS_BUCKET } from "../constants"

import { createClient } from "@/utils/supabase/server"

export const memReportSchema = z.object({
  peak_memory: z.number().int().describe("Peak memory usage in bytes"),
})

export type MemReport = z.infer<typeof memReportSchema>

export const benchPropertiesSchema = z.object({
  proving_system: z.string().optional().describe("e.g., STARK, UltraHonk"),
  field_curve: z.string().optional().describe("e.g., BabyBear, BN254"),
  iop: z.string().optional().describe("Interactive Oracle Proof type"),
  pcs: z
    .string()
    .optional()
    .describe("Polynomial Commitment Scheme (e.g., FRI, KZG)"),
  arithm: z.string().optional().describe("Arithmetization (e.g., AIR, ACIR)"),
  is_zk: z.boolean().optional().describe("Zero-knowledge property"),
  security_bits: z
    .number()
    .int()
    .optional()
    .describe("Security parameter (e.g., 96, 128)"),
  is_pq: z.boolean().optional().describe("Post-quantum secure"),
  is_maintained: z.boolean().optional().describe("Whether actively maintained"),
  is_audited: z
    .enum(["audited", "not_audited", "partially_audited"])
    .optional()
    .describe("Audit status"),
  isa: z
    .string()
    .optional()
    .describe("Instruction Set Architecture (for zkVMs, e.g., RISC-V RV32IM)"),
})

export type BenchProperties = z.infer<typeof benchPropertiesSchema>

export const metricsSchema = z.object({
  // Basic info
  name: z.string().describe("Proving system name (e.g., risc0, binius64)"),
  feat: z.string().optional().describe("Optional feature flag"),
  is_zkvm: z.boolean().describe("Whether it's a zkVM"),
  target: z.string().describe("Benchmark target (e.g., sha256, ecdsa, keccak)"),

  // Performance metrics
  input_size: z.number().int().describe("Size in bytes"),
  proof_duration: z.number().int().describe("Duration in nanoseconds"),
  verify_duration: z.number().int().describe("Duration in nanoseconds"),
  cycles: z
    .number()
    .int()
    .optional()
    .describe("Execution cycles (optional, for zkVMs)"),

  // Size metrics
  proof_size: z.number().int().describe("Size in bytes"),
  preprocessing_size: z.number().int().describe("Size in bytes"),
  num_constraints: z.number().int().describe("Number of constraints"),
  peak_memory: z.number().int().describe("Peak memory usage in bytes"),

  // System properties
  proving_system: z.string().optional().describe("e.g., STARK, UltraHonk"),
  field_curve: z.string().optional().describe("e.g., BabyBear, BN254"),
  iop: z.string().optional().describe("Interactive Oracle Proof type"),
  pcs: z
    .string()
    .optional()
    .describe("Polynomial Commitment Scheme (e.g., FRI, KZG)"),
  arithm: z.string().optional().describe("Arithmetization (e.g., AIR, ACIR)"),
  is_zk: z.boolean().optional().describe("Zero-knowledge property"),
  security_bits: z
    .number()
    .int()
    .optional()
    .describe("Security parameter (e.g., 96, 128)"),
  is_pq: z.boolean().optional().describe("Post-quantum secure"),
  is_maintained: z.boolean().optional().describe("Whether actively maintained"),
  is_audited: z
    .enum(["audited", "not_audited", "partially_audited"])
    .optional()
    .describe("Audit status"),
  isa: z
    .string()
    .optional()
    .describe("Instruction Set Architecture (for zkVMs, e.g., RISC-V RV32IM)"),
})

export type Metrics = z.infer<typeof metricsSchema>

export interface BenchmarkCollection {
  benchmarksId: string
  filename: string
  updatedAt: string | null
  data: Metrics[]
}

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
        const rawData = JSON.parse(text)

        // Validate with Zod schema
        const validatedData = z.array(metricsSchema).parse(rawData)

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

  return benchmarks.filter((b): b is NonNullable<typeof b> => b !== null)
}

import { db } from "@/db"

export const getBenchmarks = async () => {
  const data = await db.query.benchmarks.findMany()

  return data
}

export interface BenchmarkResult {
  name: string
  timestamp_completed?: string
  metadata?: {
    block_used_gas?: number
  }
  proving: {
    success?: {
      proof_size: number
      proving_time_ms: number
    }
    crashed?: {
      reason: string
    }
  }
}

export interface BenchmarkData {
  crashed: BenchmarkResult[]
  benchmarks: BenchmarkResult[]
}

// This will need to be more dynamic to support different zkVMs and versions
const GITHUB_RAW_BASE_URL =
  "https://raw.githubusercontent.com/eth-act/zkevm-benchmark-runs/refs/heads/main/proving/1x4090/eest-benchmark-v0.0.3/sp1-v5.1.0"

interface GitHubFile {
  name: string
  type: string
}

const getSuccessfulBenchmarkFiles = async (): Promise<string[]> => {
  try {
    const apiUrl = `https://api.github.com/repos/eth-act/zkevm-benchmark-runs/contents/proving/1x4090/eest-benchmark-v0.0.3/sp1-v5.1.0`
    const response = await fetch(apiUrl, {
      next: { revalidate: 60 * 60 * 24 }, // daily
    })

    if (!response.ok) {
      console.warn("Failed to fetch directory listing from GitHub API")
      return []
    }

    const files: GitHubFile[] = await response.json()

    // Filter for JSON files, excluding _crashes.txt
    const benchmarkFiles = files
      .filter(
        (file: GitHubFile) =>
          file.type === "file" &&
          file.name.endsWith(".json") &&
          file.name !== "_crashes.txt"
      )
      .map((file: GitHubFile) => file.name)

    return benchmarkFiles
  } catch (error) {
    console.warn("Error fetching benchmark files list:", error)
    return []
  }
}

const getCrashedTests = async (): Promise<BenchmarkResult[]> => {
  try {
    const crashesUrl = `${GITHUB_RAW_BASE_URL}/_crashes.txt`
    const response = await fetch(crashesUrl, {
      next: { revalidate: 60 * 60 * 24 }, // daily
    })

    if (!response.ok) {
      console.warn("Failed to fetch crashes.txt")
      return []
    }

    const crashesText = await response.text()
    const crashedFilenames = crashesText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && line.endsWith(".json"))
      .map((filename) => filename.replace(".json", ""))

    return crashedFilenames.map((name) => ({
      name,
      proving: {
        crashed: {
          reason: "prover process crashed",
        },
      },
    }))
  } catch (error) {
    console.warn("Error fetching crashed tests:", error)
    return []
  }
}

export const getBenchmarkData = async (): Promise<BenchmarkData> => {
  try {
    // Get list of all successful benchmark files dynamically
    const benchmarkFiles = await getSuccessfulBenchmarkFiles()

    if (benchmarkFiles.length === 0) {
      console.warn("No benchmark files found")
      return { crashed: [], benchmarks: [] }
    }

    // Fetch successful benchmark results
    const successResults = await Promise.allSettled(
      benchmarkFiles.map(async (filename) => {
        const encodedFilename = encodeURIComponent(filename)
        const url = `${GITHUB_RAW_BASE_URL}/${encodedFilename}`

        const response = await fetch(url, {
          next: { revalidate: 60 * 60 * 24 }, // daily
        })
        if (!response.ok) {
          throw new Error(`Failed to fetch ${filename}: ${response.status}`)
        }

        const data: BenchmarkResult = await response.json()
        return data
      })
    )

    // Get successful results
    const benchmarkData: BenchmarkResult[] = []
    successResults.forEach((result, index) => {
      if (result.status === "fulfilled") {
        benchmarkData.push(result.value)
      } else {
        console.warn(
          `Failed to load benchmark file ${benchmarkFiles[index]}:`,
          result.reason
        )
      }
    })

    // Add crashed tests
    const crashedTests = await getCrashedTests()

    return { crashed: crashedTests, benchmarks: benchmarkData }
  } catch (error) {
    console.error("Error fetching benchmark data:", error)
    return { crashed: [], benchmarks: [] }
  }
}

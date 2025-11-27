import { getProverType } from "@/lib/provers"

export interface VerificationResult {
  isValid: boolean
  error?: string
  verifyTime?: number
}

// Server-side WASM module caches
const wasmModules: Record<string, unknown> = {}

async function loadWasmModule(name: string): Promise<unknown> {
  if (wasmModules[name]) {
    return wasmModules[name]
  }

  let loadedModule: unknown
  try {
    switch (name) {
      case "pico":
      case "pico-prism":
        loadedModule = await import("@ethproofs/pico-wasm-stark-verifier")
        break
      case "sp1-hypercube":
        loadedModule = await import("@ethproofs/sp1-hypercube-wasm-verifier")
        break
      case "ziren":
        loadedModule = await import("@ethproofs/ziren-wasm-stark-verifier")
        break
      case "zisk":
        loadedModule = await import("@ethproofs/zisk-wasm-stark-verifier")
        break
      case "openvm":
        loadedModule = await import("@ethproofs/openvm-wasm-stark-verifier")
        break
      default:
        throw new Error(`Unknown prover type: ${name}`)
    }

    // Initialize the WASM module
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wasmModule = loadedModule as any
    if (wasmModule.main) {
      wasmModule.main()
    }

    wasmModules[name] = loadedModule
    return loadedModule
  } catch (err) {
    console.error(`Failed to load WASM module for ${name}:`, err)
    throw err
  }
}

export async function verifyProofServer(
  proverCluster: string,
  proofBytes: Uint8Array,
  vkBytes: Uint8Array
): Promise<VerificationResult> {
  try {
    const proverType = getProverType(proverCluster)
    if (!proverType) {
      return {
        isValid: false,
        error: `Unknown prover cluster: ${proverCluster}`,
      }
    }

    const loadedModule = await loadWasmModule(proverType)

    let result: VerificationResult

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const verifier = loadedModule as any

    // Start timing just before verification
    const startTime = performance.now()

    if (proverType === "pico") {
      // Pico uses vmType "Pico"
      const verified = verifier.verify_stark("Pico", proofBytes, vkBytes)
      result = { isValid: verified }
    } else if (proverType === "pico-prism") {
      // PicoPrism uses vmType "PicoPrism"
      const verified = verifier.verify_stark("PicoPrism", proofBytes, vkBytes)
      result = { isValid: verified }
    } else if (proverType === "sp1-hypercube") {
      const verified = verifier.verify_stark(proofBytes, vkBytes)
      result = { isValid: verified }
    } else if (proverType === "ziren") {
      const verified = verifier.verify_stark(proofBytes, vkBytes)
      result = { isValid: verified }
    } else if (proverType === "zisk") {
      const verified = verifier.verify_stark(proofBytes, vkBytes)
      result = { isValid: verified }
    } else if (proverType === "openvm") {
      const verified = verifier.verify_stark(proofBytes, vkBytes)
      result = { isValid: verified }
    } else {
      result = { isValid: false, error: "Proof cannot be verified" }
    }

    const duration = performance.now() - startTime
    result.verifyTime = duration

    return result
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Verification failed",
    }
  }
}

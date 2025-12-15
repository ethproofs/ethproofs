import { type VerifiableZkvmSlug } from "@/lib/zkvm-verifiers"

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
  zkvmSlug: VerifiableZkvmSlug,
  proofBytes: Uint8Array,
  vkBytes: Uint8Array
): Promise<VerificationResult> {
  try {
    const loadedModule = await loadWasmModule(zkvmSlug)

    let result: VerificationResult

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const verifier = loadedModule as any

    // Start timing just before verification
    const startTime = performance.now()

    if (zkvmSlug === "pico") {
      const verified = verifier.verify_stark("PicoPrism", proofBytes, vkBytes)
      result = { isValid: verified }
    } else if (zkvmSlug === "sp1-hypercube") {
      const verified = verifier.verify_stark(proofBytes, vkBytes)
      result = { isValid: verified }
    } else if (zkvmSlug === "ziren") {
      const verified = verifier.verify_stark(proofBytes, vkBytes)
      result = { isValid: verified }
    } else if (zkvmSlug === "zisk") {
      const verified = verifier.verify_stark(proofBytes, vkBytes)
      result = { isValid: verified }
    } else if (zkvmSlug === "openvm") {
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

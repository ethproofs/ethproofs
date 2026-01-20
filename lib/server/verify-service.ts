import {
  isVerifiableZkvmWithoutVk,
  type VerifiableZkvmSlug,
} from "@/lib/zkvm-verifiers"

export interface VerificationResult {
  isValid: boolean
  error?: string
  verifyTime?: number
}

interface WasmModule {
  main?(): void
  verify_stark(
    ...args:
      | [Uint8Array]
      | [Uint8Array, Uint8Array]
      | [string, Uint8Array, Uint8Array]
  ): boolean
}

// Server-side WASM module caches
const wasmModules: Record<string, WasmModule> = {}
const fallbackModules: Record<string, WasmModule> = {}

async function loadWasmModule(name: string): Promise<WasmModule> {
  if (wasmModules[name]) {
    return wasmModules[name]
  }

  let loadedModule: WasmModule
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
      case "airbender":
        loadedModule = await import("@ethproofs/airbender-wasm-stark-verifier")
        break
      default:
        throw new Error(`Unknown prover type: ${name}`)
    }

    // Initialize the WASM module
    if (loadedModule.main) {
      loadedModule.main()
    }

    wasmModules[name] = loadedModule
    return loadedModule
  } catch (err) {
    console.error(`Failed to load WASM module for ${name}:`, err)
    throw err
  }
}

async function loadFallbackModule(name: string): Promise<WasmModule | null> {
  if (fallbackModules[name]) {
    return fallbackModules[name]
  }

  let loadedModule: WasmModule
  try {
    switch (name) {
      case "zisk":
        loadedModule = await import(
          "@ethproofs/zisk-wasm-stark-verifier-v0.12.0"
        )
        break
      default:
        return null
    }

    // Initialize the WASM module
    if (loadedModule.main) {
      loadedModule.main()
    }

    fallbackModules[name] = loadedModule
    return loadedModule
  } catch (err) {
    console.warn(`Failed to load fallback WASM module for ${name}:`, err)
    return null
  }
}

function verifyWithModule(
  verifier: WasmModule,
  zkvmSlug: VerifiableZkvmSlug,
  proofBytes: Uint8Array,
  vkBytes: Uint8Array
): boolean {
  if (zkvmSlug === "pico") {
    return verifier.verify_stark("PicoPrism", proofBytes, vkBytes)
  } else if (isVerifiableZkvmWithoutVk(zkvmSlug)) {
    return verifier.verify_stark(proofBytes)
  } else {
    return verifier.verify_stark(proofBytes, vkBytes)
  }
}

export async function verifyProofServer(
  zkvmSlug: VerifiableZkvmSlug,
  proofBytes: Uint8Array,
  vkBytes: Uint8Array
): Promise<VerificationResult> {
  const startTime = performance.now()

  try {
    const verifier = await loadWasmModule(zkvmSlug)
    const verified = verifyWithModule(verifier, zkvmSlug, proofBytes, vkBytes)

    if (verified) {
      const verifyTime = performance.now() - startTime
      return { isValid: true, verifyTime }
    }
  } catch (primaryError) {
    // Primary verification threw an error, try fallback if available
    const fallbackModule = await loadFallbackModule(zkvmSlug)
    if (fallbackModule) {
      try {
        const fallbackVerified = verifyWithModule(
          fallbackModule,
          zkvmSlug,
          proofBytes,
          vkBytes
        )
        if (fallbackVerified) {
          const verifyTime = performance.now() - startTime
          return { isValid: true, verifyTime }
        }
      } catch {
        // Both failed, return primary error
        return {
          isValid: false,
          error:
            primaryError instanceof Error
              ? primaryError.message
              : "Verification failed",
        }
      }
    }

    return {
      isValid: false,
      error:
        primaryError instanceof Error
          ? primaryError.message
          : "Verification failed",
    }
  }

  // Primary returned false, try fallback
  const fallbackModule = await loadFallbackModule(zkvmSlug)
  if (fallbackModule) {
    try {
      const fallbackVerified = verifyWithModule(
        fallbackModule,
        zkvmSlug,
        proofBytes,
        vkBytes
      )
      const verifyTime = performance.now() - startTime
      return { isValid: fallbackVerified, verifyTime }
    } catch {
      // Fallback also failed, return primary result (false)
      const verifyTime = performance.now() - startTime
      return { isValid: false, verifyTime }
    }
  }

  const verifyTime = performance.now() - startTime
  return { isValid: false, verifyTime }
}

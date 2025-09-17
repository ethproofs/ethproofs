/**
 * WASM Module Cache
 * Prevents multiple initializations of heavy WASM modules during development
 */

interface WasmModule {
  module: unknown
  isInitialized: boolean
  initPromise?: Promise<unknown>
}

class WasmModuleCache {
  private cache = new Map<string, WasmModule>()

  async getModule(
    moduleName: string,
    importFn: () => Promise<unknown>,
    initFn?: (module: unknown) => void
  ): Promise<unknown> {
    const cached = this.cache.get(moduleName)

    if (cached?.isInitialized) {
      return cached.module
    }

    if (cached?.initPromise) {
      // Module is already being initialized, wait for it
      await cached.initPromise
      return this.cache.get(moduleName)?.module
    }

    // Initialize new module
    const initPromise = this.initializeModule(moduleName, importFn, initFn)
    this.cache.set(moduleName, {
      module: null,
      isInitialized: false,
      initPromise,
    })

    const wasmModule = await initPromise
    return wasmModule
  }

  private async initializeModule(
    moduleName: string,
    importFn: () => Promise<unknown>,
    initFn?: (module: unknown) => void
  ): Promise<unknown> {
    try {
      console.log(`[WasmCache] Initializing ${moduleName}...`)
      const wasmModule = await importFn()

      if (initFn) {
        initFn(wasmModule)
      }

      this.cache.set(moduleName, {
        module: wasmModule,
        isInitialized: true,
      })

      console.log(`[WasmCache] ${moduleName} initialized successfully`)
      return wasmModule
    } catch (error) {
      console.error(`[WasmCache] Failed to initialize ${moduleName}:`, error)
      this.cache.delete(moduleName)
      throw error
    }
  }

  clearCache(): void {
    this.cache.clear()
  }

  isModuleLoaded(moduleName: string): boolean {
    return this.cache.get(moduleName)?.isInitialized ?? false
  }
}

export const wasmCache = new WasmModuleCache()
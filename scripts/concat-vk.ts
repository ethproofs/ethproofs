/**
 * For use with @ethproofs/airbender-wasm-stark-verifier.
 *
 * Concatenate the setup and layout files into a single vk file.
 *
 * Usage:
 *   npx tsx scripts/concat-vk.ts <setup.bin> <layout.bin> [output.bin]
 */

import { mkdirSync } from "node:fs"
import { readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"

const LENGTH_PREFIX_BYTES = 4

async function main() {
  const [setupPath, layoutPath, outputPath] = process.argv.slice(2)

  if (!setupPath || !layoutPath) {
    console.error(
      "usage: npx tsx scripts/concat-vk.ts <setup.bin> <layout.bin> [output.bin]"
    )
    process.exit(1)
  }

  const setup = new Uint8Array(await readFile(setupPath))
  const layout = new Uint8Array(await readFile(layoutPath))

  const combined = new Uint8Array(
    LENGTH_PREFIX_BYTES + setup.byteLength + layout.byteLength
  )
  const view = new DataView(combined.buffer)
  view.setUint32(0, setup.byteLength)
  combined.set(setup, LENGTH_PREFIX_BYTES)
  combined.set(layout, LENGTH_PREFIX_BYTES + setup.byteLength)

  const outputDir = join(__dirname, "output")
  mkdirSync(outputDir, { recursive: true })
  const out = outputPath ?? join(outputDir, "vk.bin")
  await writeFile(out, combined)
  console.log(
    `wrote ${out} (${combined.byteLength} bytes: ${LENGTH_PREFIX_BYTES}b prefix + ${setup.byteLength}b setup + ${layout.byteLength}b layout)`
  )
}

main()

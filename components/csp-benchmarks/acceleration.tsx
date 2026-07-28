import { getProverKey } from "./metrics"
import { InfoPopover } from "./shared"

import type { Acceleration, Metrics } from "@/lib/api/csp-benchmarks"

const accelerationOrder: Acceleration[] = ["precompile", "inline"]
const accelerationMarkers: Record<Acceleration, string> = {
  precompile: "*",
  inline: "**",
}

export function AccelerationFootnote() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <InfoPopover trigger={<span>* uses precompiles</span>}>
        <p>
          The operation is proved using a dedicated implementation instead of
          the system&apos;s ordinary instructions or constraints.
        </p>
      </InfoPopover>
      <InfoPopover trigger={<span>** uses inlines</span>}>
        <p>
          The operation is proved using specialized VM instructions that
          replace a longer sequence of ordinary VM instructions.
        </p>
      </InfoPopover>
    </div>
  )
}

export function getAccelerationMarker(
  acceleration: Acceleration | undefined
): string {
  return acceleration ? accelerationMarkers[acceleration] : ""
}

export function getAccelerationLabels(
  benchmarks: Metrics[]
): Map<string, string> {
  const accelerationsByProver = new Map<string, Set<Acceleration>>()

  for (const benchmark of benchmarks) {
    if (!benchmark.acceleration) continue

    const key = getProverKey(benchmark)
    const accelerations = accelerationsByProver.get(key) ?? new Set()
    accelerations.add(benchmark.acceleration)
    accelerationsByProver.set(key, accelerations)
  }

  const labels = new Map<string, string>()

  for (const [key, accelerations] of accelerationsByProver) {
    const markers = accelerationOrder
      .filter((acceleration) => accelerations.has(acceleration))
      .map(getAccelerationMarker)
      .join("/")
    labels.set(key, `${key}${markers}`)
  }

  return labels
}

export function hasAcceleratedMeasurements(benchmarks: Metrics[]): boolean {
  return benchmarks.some((benchmark) => benchmark.acceleration)
}

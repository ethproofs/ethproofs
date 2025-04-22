import { cn } from "@/lib/utils"

type LevelMeterProps = React.ComponentProps<"div"> & {
  bestThreshold: number
  worstThreshold: number
  value: number
  unit: string
}
const LevelMeter = ({
  className,
  bestThreshold,
  worstThreshold,
  value,
  unit,
}: LevelMeterProps) => {
  const valueXPosition = (() => {
    const THIRD = 100 / 3
    const TWO_THIRDS = 2 * THIRD
    // Best threshold is at 66%, worst threshold is at 33%
    if (value <= bestThreshold) {
      // Value is better than or equal to best threshold (positioned at or right of 66%)
      // When value = bestThreshold, position = 66%
      // When value < bestThreshold, position moves toward 100% proportionally
      const betterRatio = Math.min(
        1,
        Math.max(0, (bestThreshold - value) / bestThreshold)
      )
      return TWO_THIRDS + betterRatio * THIRD // 66% to 100%
    } else if (value >= worstThreshold) {
      // Value is worse than or equal to worst threshold (positioned at or left of 33%)
      // When value = worstThreshold, position = 33%
      // When value > worstThreshold, position moves toward 0% proportionally
      const worseRatio = Math.min(
        1,
        Math.max(0, (value - worstThreshold) / worstThreshold)
      )
      return Math.max(0, THIRD - worseRatio * THIRD) // 33% to 0%
    } else {
      // Value is between thresholds (positioned between 33% and 66%)
      // Linear interpolation between worst (33%) and best (66%)
      const ratio = (worstThreshold - value) / (worstThreshold - bestThreshold)
      return THIRD + ratio * THIRD // 33% to 66%
    }
  })()

  return (
    <div
      className={cn("relative grid w-full grid-cols-6 space-y-1", className)}
    >
      <div
        data-label="colored-meter"
        className="col-span-6 grid h-1.5 grid-cols-subgrid overflow-hidden rounded-full"
      >
        <div className="bg-level-worst col-span-2 col-start-1 row-start-1" />
        <div className="bg-level-middle col-span-2 col-start-3 row-start-1" />
        <div className="bg-level-best col-span-2 col-start-5 row-start-1" />
      </div>

      <div
        data-label="worst-threshold"
        className="col-span-2 col-start-2 row-start-2 text-center text-body-secondary"
      >
        {worstThreshold}
        {unit}
      </div>

      <div
        data-label="best-threshold"
        className="col-span-2 col-start-4 row-start-2 text-center text-body-secondary"
      >
        {bestThreshold}
        {unit}
      </div>

      <div
        data-label="current-value"
        className="absolute z-10"
        style={{ insetInlineStart: valueXPosition + "%" }}
      >
        <span className="absolute -translate-x-1/2 -translate-y-9 font-mono">
          {value}
          {unit}
          <div className="relative flex w-full flex-col">
            <div className="col-span-2 place-items-center">
              <div className="absolute bottom-full start-1/2 size-1 -translate-x-1/2 rounded-full bg-body" />
            </div>
            <div className="flex h-4 w-full">
              <div className="flex-1 border-e border-body"></div>
              <div className="flex-1" data-label="spacer" />
            </div>
          </div>
        </span>
      </div>
    </div>
  )
}

LevelMeter.displayName = "LevelMeter"

export default LevelMeter

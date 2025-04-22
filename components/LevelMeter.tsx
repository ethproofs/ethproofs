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
  const calculateValuePosition = () => {
    // Best threshold is at 66%, worst threshold is at 33%
    if (value <= bestThreshold) {
      // Value is better than or equal to best threshold (positioned at or right of 66%)
      // When value = bestThreshold, position = 66%
      // When value < bestThreshold, position moves toward 100% proportionally
      const betterRatio = Math.min(
        1,
        Math.max(0, (bestThreshold - value) / bestThreshold)
      )
      return 66 + betterRatio * 34 // 66% to 100%
    } else if (value >= worstThreshold) {
      // Value is worse than or equal to worst threshold (positioned at or left of 33%)
      // When value = worstThreshold, position = 33%
      // When value > worstThreshold, position moves toward 0% proportionally
      const worseRatio = Math.min(
        1,
        Math.max(0, (value - worstThreshold) / worstThreshold)
      )
      return Math.max(0, 33 - worseRatio * 33) // 33% to 0%
    } else {
      // Value is between thresholds (positioned between 33% and 66%)
      // Linear interpolation between worst (33%) and best (66%)
      const ratio = (worstThreshold - value) / (worstThreshold - bestThreshold)
      return 33 + ratio * 33 // 33% to 66%
    }
  }
  const valueXPosition = calculateValuePosition()

  return (
    <div className={cn("relative grid w-full grid-cols-6", className)}>
      <div className="col-span-6 grid h-1.5 grid-cols-subgrid overflow-hidden rounded-full">
        <div className="bg-level-worst col-span-2 col-start-1 row-start-1" />
        <div className="bg-level-middle col-span-2 col-start-3 row-start-1" />
        <div className="bg-level-best col-span-2 col-start-5 row-start-1" />
      </div>
      <div
        className="absolute z-10"
        style={{ insetInlineStart: valueXPosition + "%" }}
      >
        <span className="absolute -translate-x-1/2 -translate-y-[2.5em]">
          {value}
          {unit}
          <br />
          <span className="relative">
            |
            <div className="absolute inset-0 size-1 rounded-full bg-body" />
          </span>
        </span>
      </div>

      <div className="col-span-2 col-start-2 row-start-2 text-center text-body-secondary">
        {worstThreshold}
        {unit}
      </div>
      <div className="col-span-2 col-start-4 row-start-2 text-center text-body-secondary">
        {bestThreshold}
        {unit}
      </div>
    </div>
  )
}

LevelMeter.displayName = "LevelMeter"

export default LevelMeter

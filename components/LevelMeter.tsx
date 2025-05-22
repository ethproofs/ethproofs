import { cn } from "@/lib/utils"

export type LevelMeterProps = React.ComponentProps<"div"> & {
  bestThreshold: number
  worstThreshold: number
  value: number
  formatValue?: (value: number) => string
  disabled?: boolean
}
const LevelMeter = ({
  className,
  bestThreshold,
  worstThreshold,
  value,
  formatValue,
  disabled,
}: LevelMeterProps) => {
  const valueXPosition = (() => {
    const THIRD = 100 / 3
    const TWO_THIRDS = 2 * THIRD

    // Use log2 scale for value, bestThreshold, and worstThreshold
    // Clamp to avoid log2(0) or negative numbers
    const safeValue = Math.max(value, 1e-9)
    const safeBest = Math.max(bestThreshold, 1e-9)
    const safeWorst = Math.max(worstThreshold, 1e-9)

    const logBest = Math.log2(safeBest)
    const logWorst = Math.log2(safeWorst)
    const logValue = Math.log2(safeValue)

    if (logValue <= logBest) {
      // Value is better than or equal to best threshold (right of 66%)
      const betterRatio = Math.min(
        1,
        Math.max(0, (logBest - logValue) / Math.abs(logBest - logWorst))
      )
      return TWO_THIRDS + betterRatio * THIRD // 66% to 100%
    } else if (logValue >= logWorst) {
      // Value is worse than or equal to worst threshold (left of 33%)
      const worseRatio = Math.min(
        1,
        Math.max(0, (logValue - logWorst) / Math.abs(logWorst - logBest))
      )
      return Math.max(0, THIRD - worseRatio * THIRD) // 33% to 0%
    } else {
      // Value is between thresholds (33% to 66%)
      const ratio = (logWorst - logValue) / (logWorst - logBest)
      return THIRD + ratio * THIRD // 33% to 66%
    }
  })()

  return (
    <div
      className={cn(
        "relative grid w-full grid-cols-6 space-y-1",
        disabled && "grayscale",
        className
      )}
    >
      <div
        data-label="colored-meter"
        className="col-span-6 grid h-1.5 grid-cols-subgrid overflow-hidden rounded-full"
      >
        <div className="col-span-2 col-start-1 row-start-1 bg-level-worst" />
        <div className="col-span-2 col-start-3 row-start-1 bg-level-middle" />
        <div className="col-span-2 col-start-5 row-start-1 bg-level-best" />
      </div>

      <div
        data-label="worst-threshold"
        className="col-span-2 col-start-2 row-start-2 text-center text-body-secondary"
      >
        {formatValue ? formatValue(worstThreshold) : worstThreshold}
      </div>

      <div
        data-label="best-threshold"
        className="col-span-2 col-start-4 row-start-2 text-center text-body-secondary"
      >
        {formatValue ? formatValue(bestThreshold) : bestThreshold}
      </div>

      {!disabled && (
        <div
          data-label="current-value"
          className="absolute z-10"
          style={{ insetInlineStart: valueXPosition + "%" }}
        >
          <span className="absolute -translate-x-1/2 -translate-y-9 font-mono">
            {formatValue ? formatValue(value) : value}
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
      )}
    </div>
  )
}

LevelMeter.displayName = "LevelMeter"

export default LevelMeter

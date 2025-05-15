import { SeverityLevel } from "@/lib/types"

import PizzaSliceEighth from "@/components/svgs/pizza-slice-n-8.svg"

import { cn } from "@/lib/utils"

type Breakdown = {
  [key in SeverityLevel]: string
}
type ZkvmPopoverDetailsProps = React.HTMLAttributes<HTMLDivElement> & {
  breakdown: Breakdown
  activeSeverity?: SeverityLevel
}

const ZkvmPopoverDetails = ({
  breakdown,
  activeSeverity,
  children,
  className,
}: ZkvmPopoverDetailsProps) => {
  const orderedItems = ["red", "yellow", "green"] as SeverityLevel[]

  const getSliceRotationClass = (level: SeverityLevel) => {
    if (level === orderedItems[0]) return "rotate-[-60deg]"
    if (level === orderedItems[2]) return "rotate-[60deg]"
    return "rotate-0"
  }

  const getSliceColorClass = (level: SeverityLevel) => {
    if (level === "red") return "text-level-worst"
    if (level === "yellow") return "text-level-middle"
    if (level === "green") return "text-level-best"
    return ""
  }

  const getSliceSaturateClass = (level: SeverityLevel) => {
    if (!activeSeverity) return ""
    if (level !== activeSeverity) return "saturate-50"
    return ""
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="mb-4">{children}</p>

      <div className="grid grid-cols-3 gap-x-4 gap-y-1 px-6">
        <div
          className={cn(
            "align-center col-start-1 row-start-2 flex items-center justify-end text-end font-semibold text-level-worst",
            activeSeverity &&
              (activeSeverity === orderedItems[0]
                ? "scale-[115%] underline"
                : "saturate-50")
          )}
        >
          {breakdown[orderedItems[0]]}
        </div>

        <div
          className={cn(
            "col-start-2 row-start-1 flex justify-center text-center font-semibold text-yellow-700 dark:text-level-middle",
            activeSeverity === orderedItems[1]
              ? "scale-[115%] underline"
              : "saturate-50"
          )}
        >
          {breakdown[orderedItems[1]]}
        </div>

        <div
          className={cn(
            "col-start-3 row-start-2 flex items-center justify-start text-start font-semibold text-primary",
            activeSeverity === orderedItems[2]
              ? "scale-[115%] underline"
              : "saturate-50"
          )}
        >
          {breakdown[orderedItems[2]]}
        </div>

        <div className="relative col-start-2 row-start-2 grid h-12 w-auto place-items-center">
          {orderedItems.map((level) => (
            <PizzaSliceEighth
              key={level}
              width="0.7288135593em"
              height="1em"
              className={cn(
                "absolute inline origin-[50%_120%] scale-x-[133%] text-3xl",
                getSliceRotationClass(level),
                getSliceColorClass(level),
                getSliceSaturateClass(level)
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

ZkvmPopoverDetails.displayName = "ZkvmPopoverDetails"

export default ZkvmPopoverDetails

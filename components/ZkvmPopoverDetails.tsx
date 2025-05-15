import { SeverityLevel } from "@/lib/types"

import PizzaSliceEighth from "@/components/svgs/pizza-slice-n-8.svg"

import { cn } from "@/lib/utils"

type Breakdown = {
  [key in SeverityLevel]: string
}
type ZkvmPopoverDetailsProps = React.HTMLAttributes<HTMLDivElement> & {
  breakdown: Breakdown
}

const ZkvmPopoverDetails = ({
  breakdown,
  children,
  className,
}: ZkvmPopoverDetailsProps) => {
  const orderedItems = ["red", "yellow", "green"] as SeverityLevel[]
  return (
    <div className={cn("space-y-2", className)}>
      <p className="mb-4">{children}</p>

      <div className="grid grid-cols-3 gap-x-5 gap-y-2 px-6">
        <div className="align-center col-start-1 row-start-2 flex items-center justify-end text-end text-level-worst">
          {breakdown[orderedItems[0]]}
        </div>

        <div className="col-start-2 row-start-1 flex justify-center text-center text-level-middle">
          {breakdown[orderedItems[1]]}
        </div>

        <div className="col-start-3 row-start-2 flex items-center justify-start text-start text-level-best">
          {breakdown[orderedItems[2]]}
        </div>

        <div className="relative col-start-2 row-start-2 grid h-12 w-auto place-items-center">
          {orderedItems.map((level) => (
            <PizzaSliceEighth
              key={level}
              width="0.7288135593em"
              height="1em"
              className={cn(
                "inline text-3xl",
                level === "red" &&
                  "absolute origin-[50%_120%] -rotate-45 text-level-worst",
                level === "yellow" && "absolute rotate-0 text-level-middle",
                level === "green" &&
                  "absolute origin-[50%_120%] rotate-45 text-level-best"
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

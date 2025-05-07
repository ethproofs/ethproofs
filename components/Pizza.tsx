import type { SeverityLevel, Slices } from "@/lib/types"

import PizzaSliceEighth from "@/components/svgs/pizza-slice-n-8.svg"

import { cn } from "@/lib/utils"

type PizzaProps = React.ComponentProps<"div"> & {
  slices: Slices
  disableEffects?: boolean
}

/**
 * Pizza component that displays a pizza with 8 slices.
 * Each slice can have different levels and hover effects.
 *
 * @param {PizzaProps} props - The properties for the Pizza component.
 * @param {Array<{ level: SeverityLevel }>} props.slices - An array of slice objects, each containing a `level` property
 * indicating the slice's level (e.g., "green", "yellow", "red").
 * @param {boolean} [props.disableEffects] - If true, disables hover effects on the slices.
 * @param {string} [props.className] - Additional CSS class names to apply to the pizza container.
 * @param {object} [props.props] - Additional props to spread onto the root container element.
 *
 * @returns {JSX.Element} A JSX element representing the pizza visualization.
 */
const Pizza = ({
  slices,
  disableEffects,
  className,
  ...props
}: PizzaProps): JSX.Element => {
  // Restrict hover effect to the slice itself
  const clipPath =
    "polygon(46% 100%, 0% 21%, 0% 10%, 16% 0%, 84% 0%, 100% 10%, 100% 21%, 54% 100%)"

  const sharedClasses = cn(
    "absolute origin-[50%_120%]",
    !disableEffects &&
      "transition-all hover:scale-[115%] hover:cursor-pointer hover:!opacity-100 hover:!saturate-100"
  )

  const ROTATIONS = [
    "rotate-[22.5deg]",
    "rotate-[67.5deg]",
    "rotate-[112.5deg]",
    "rotate-[157.5deg]",
    "rotate-[202.5deg]",
    "rotate-[247.5deg]",
    "rotate-[292.5deg]",
    "rotate-[337.5deg]",
  ] as const

  const COLORS: { [key in SeverityLevel]: string } = {
    green: "text-level-best",
    yellow: "text-level-middle",
    red: "text-level-worst",
  }

  const GROUP_HOVER = [
    "group-has-[[data-index='0']:hover]/software:scale-[115%] group-has-[:not([data-index='0']):hover]/software:saturate-[25%] group-has-[[data-index='0']:hover]/software:saturate-100",
    "group-has-[[data-index='1']:hover]/software:scale-[115%] group-has-[:not([data-index='1']):hover]/software:saturate-[25%] group-has-[[data-index='1']:hover]/software:saturate-100",
    "group-has-[[data-index='2']:hover]/software:scale-[115%] group-has-[:not([data-index='2']):hover]/software:saturate-[25%] group-has-[[data-index='2']:hover]/software:saturate-100",
    "group-has-[[data-index='3']:hover]/software:scale-[115%] group-has-[:not([data-index='3']):hover]/software:saturate-[25%] group-has-[[data-index='3']:hover]/software:saturate-100",
    "group-has-[[data-index='4']:hover]/software:scale-[115%] group-has-[:not([data-index='4']):hover]/software:saturate-[25%] group-has-[[data-index='4']:hover]/software:saturate-100",
    "group-has-[[data-index='5']:hover]/software:scale-[115%] group-has-[:not([data-index='5']):hover]/software:saturate-[25%] group-has-[[data-index='5']:hover]/software:saturate-100",
    "group-has-[[data-index='6']:hover]/software:scale-[115%] group-has-[:not([data-index='6']):hover]/software:saturate-[25%] group-has-[[data-index='6']:hover]/software:saturate-100",
    "group-has-[[data-index='7']:hover]/software:scale-[115%] group-has-[:not([data-index='7']):hover]/software:saturate-[25%] group-has-[[data-index='7']:hover]/software:saturate-100",
  ] as const

  return (
    <div
      className={cn(
        "relative box-content flex size-[0.94em] justify-center rounded-full border-[0.05em] border-background-accent bg-background-accent shadow-lg",
        className
      )}
      {...props}
    >
      {slices.map(({ level }, idx) => (
        <div
          className={cn(
            sharedClasses,
            ROTATIONS[idx % ROTATIONS.length],
            COLORS[level],
            GROUP_HOVER[idx]
          )}
          key={idx}
          style={{ clipPath }}
        >
          <PizzaSliceEighth />
        </div>
      ))}
    </div>
  )
}

Pizza.displayName = "Pizza"

export default Pizza

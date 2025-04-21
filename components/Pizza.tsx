import type { Level, Slices } from "@/lib/types"

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
 * @param {Array<{ level: Level }>} props.slices - An array of slice objects, each containing a `level` property
 * indicating the slice's level (e.g., "best", "middle", "worst").
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
      "transition-all duration-200 hover:scale-[115%] hover:cursor-pointer hover:!opacity-100 hover:!saturate-100 group-hover:opacity-75 group-hover:saturate-0"
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

  const COLORS: { [key in Level]: string } = {
    best: "text-level-best",
    middle: "text-level-middle",
    worst: "text-level-worst",
  }

  return (
    <div
      className={cn(
        "bg-background-accent border-background-accent group relative box-content flex size-[0.94em] justify-center rounded-full border-[0.05em] shadow-lg",
        className
      )}
      {...props}
    >
      {slices.map(({ level }, idx) => (
        <div
          className={cn(
            sharedClasses,
            ROTATIONS[idx % ROTATIONS.length],
            COLORS[level]
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

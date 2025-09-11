import { cva, VariantProps } from "class-variance-authority"

import type { SummaryItem } from "@/lib/types"

import { cn } from "@/lib/utils"

const variants = cva("row-span-2 grid grid-rows-subgrid gap-1 p-2", {
  variants: {
    layout: {
      default: "",
      flipped: "grid-rows-subgrid-reverse",
    },
  },
  defaultVariants: {
    layout: "default",
  },
})

type KPIProps = VariantProps<typeof variants> & {
  item: SummaryItem
}
export const KPI = ({ item, layout = "default" }: KPIProps) => {
  if (layout === "flipped")
    return (
      <div className={cn(variants({ layout }))}>
        {/* Row 1 - Metric label */}
        <div>
          <p className="whitespace-nowrap text-center text-sm font-medium">
            {item.label}
          </p>
        </div>
        {/* Row 2 - Metric value */}
        <div className="col-span-1 row-span-1 flex h-full flex-col items-center justify-center">
          <p className="h-auto whitespace-nowrap text-nowrap text-center text-2xl font-semibold text-primary">
            {item.value}
          </p>
        </div>
      </div>
    )
  return (
    <div className={cn(variants({ layout }))}>
      {/* Row 1 - Metric icon and value */}
      <div className="col-span-1 row-span-1 flex h-full flex-col items-center justify-center gap-x-2 md:flex-row">
        {item.icon && (
          <p className="whitespace-nowrap text-3xl font-medium text-primary lg:text-4xl">
            {item.icon}
          </p>
        )}
        <p className="h-auto whitespace-nowrap text-nowrap text-center text-3xl font-medium text-primary lg:text-4xl">
          {item.value}
        </p>
      </div>
      {/* Row 2 - Metric label */}
      <div>
        <p className="whitespace-nowrap text-center text-sm font-medium">
          {item.label}
        </p>
      </div>
    </div>
  )
}

type KPIsProps = VariantProps<typeof variants> & {
  items: SummaryItem[]
}

const KPIs = ({ items, layout }: KPIsProps) => (
  <div className="mx-auto flex w-full max-w-2xl flex-wrap justify-around gap-x-12 gap-y-4">
    {items.map((item) => (
      <KPI key={item.key} item={item} layout={layout} />
    ))}
  </div>
)

export default KPIs

import type { SummaryItem } from "@/lib/types"

export const KPI = ({ item }: { item: SummaryItem }) => (
  <div className="row-span-2 grid grid-rows-subgrid gap-1 p-2">
    {/* Row 1 - Metric icon and value */}
    <div className="col-span-1 row-span-1 flex h-full flex-col items-center justify-center gap-x-2 md:flex-row">
      {item.icon && (
        <p className="whitespace-nowrap font-mono text-2xl font-medium text-primary md:text-3xl lg:text-4xl">
          {item.icon}
        </p>
      )}
      <p className="h-auto whitespace-nowrap text-nowrap text-center font-mono text-2xl font-medium text-primary md:text-3xl lg:text-4xl">
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

const KPIs = ({ items }: { items: SummaryItem[] }) => (
  <div className="mx-auto grid w-full max-w-2xl grid-cols-[auto,auto,auto] gap-x-8 gap-y-4">
    {items.map((item) => (
      <KPI key={item.key} item={item} />
    ))}
  </div>
)

export default KPIs

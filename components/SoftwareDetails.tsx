import type { SoftwareDetailItem } from "@/lib/types"

import { cn } from "@/lib/utils"

import { MetricBox, MetricInfo, MetricLabel } from "./ui/metric"
import LevelMeter from "./LevelMeter"
import Pizza from "./Pizza"

import { getSlices } from "@/lib/zkvms"

const DetailItem = ({ item }: { item: SoftwareDetailItem }) => (
  <div className={item.className} data-index={item.position}>
    <MetricBox className="py-0">
      {"chartInfo" in item && <LevelMeter {...item.chartInfo} />}
    </MetricBox>
    <MetricLabel>
      <MetricInfo label={item.label}>{item.popoverDetails}</MetricInfo>
    </MetricLabel>
    {"value" in item && (
      <div className="text-center font-sans text-base">{item.value}</div>
    )}
  </div>
)

DetailItem.displayName = "DetailItem"

type SoftwareDetailsProps = {
  detailItems: SoftwareDetailItem[]
  className?: string
}

const SoftwareDetails = ({ detailItems, className }: SoftwareDetailsProps) => (
  <div
    className={cn(
      "group/software grid grid-cols-[1fr,4fr,auto,4fr,1fr] gap-8 p-8",
      className
    )}
  >
    {detailItems.map((item) => (
      <DetailItem key={item.id} item={item} />
    ))}

    <div className="col-start-3 row-span-3 row-start-2 flex flex-col items-center text-[10rem]">
      <Pizza slices={getSlices(detailItems)} />
    </div>
  </div>
)

SoftwareDetails.displayName = "SoftwareDetails"

export default SoftwareDetails

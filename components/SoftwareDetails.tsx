import type { SoftwareDetailItem } from "@/lib/types"

import { cn } from "@/lib/utils"

import { MetricBox, MetricInfo, MetricLabel } from "./ui/metric"
import LevelMeter from "./LevelMeter"
import Pizza from "./Pizza"

import { getSlices } from "@/lib/zkvms"

const DetailItem = ({ item }: { item: SoftwareDetailItem }) => {
  const GROUP_HOVER = [
    "group-has-[:not([data-index='0']):hover]/software:opacity-[50%] group-has-[[data-index='0']:hover]/software:opacity-[100%] group-has-[[data-index='0']:hover]/software:scale-110 group-has-[[data-label='pizza']>[data-index='0']:hover]/software:scale-110 scale-100 transition-all",
    "group-has-[:not([data-index='1']):hover]/software:opacity-[50%] group-has-[[data-index='1']:hover]/software:opacity-[100%] group-has-[[data-index='1']:hover]/software:scale-110 group-has-[[data-label='pizza']>[data-index='1']:hover]/software:scale-110 scale-100 transition-all",
    "group-has-[:not([data-index='2']):hover]/software:opacity-[50%] group-has-[[data-index='2']:hover]/software:opacity-[100%] group-has-[[data-index='2']:hover]/software:scale-110 group-has-[[data-label='pizza']>[data-index='2']:hover]/software:scale-110 scale-100 transition-all",
    "group-has-[:not([data-index='3']):hover]/software:opacity-[50%] group-has-[[data-index='3']:hover]/software:opacity-[100%] group-has-[[data-index='3']:hover]/software:scale-110 group-has-[[data-label='pizza']>[data-index='3']:hover]/software:scale-110 scale-100 transition-all",
    "group-has-[:not([data-index='4']):hover]/software:opacity-[50%] group-has-[[data-index='4']:hover]/software:opacity-[100%] group-has-[[data-index='4']:hover]/software:scale-110 group-has-[[data-label='pizza']>[data-index='4']:hover]/software:scale-110 scale-100 transition-all",
    "group-has-[:not([data-index='5']):hover]/software:opacity-[50%] group-has-[[data-index='5']:hover]/software:opacity-[100%] group-has-[[data-index='5']:hover]/software:scale-110 group-has-[[data-label='pizza']>[data-index='5']:hover]/software:scale-110 scale-100 transition-all",
    "group-has-[:not([data-index='6']):hover]/software:opacity-[50%] group-has-[[data-index='6']:hover]/software:opacity-[100%] group-has-[[data-index='6']:hover]/software:scale-110 group-has-[[data-label='pizza']>[data-index='6']:hover]/software:scale-110 scale-100 transition-all",
    "group-has-[:not([data-index='7']):hover]/software:opacity-[50%] group-has-[[data-index='7']:hover]/software:opacity-[100%] group-has-[[data-index='7']:hover]/software:scale-110 group-has-[[data-label='pizza']>[data-index='7']:hover]/software:scale-110 scale-100 transition-all",
  ] as const

  return (
    <div
      className={cn(
        "text-center",
        "chartInfo" in item && "mb-2 mt-8 flex-1",
        "value" in item && "mx-auto w-fit",
        GROUP_HOVER[item.position],
        item.className
      )}
      data-index={item.position}
      style={{ gridArea: `position${item.position}` }}
    >
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
}

DetailItem.displayName = "DetailItem"

type SoftwareDetailsProps = {
  detailItems: SoftwareDetailItem[]
  className?: string
}

const SoftwareDetails = ({ detailItems, className }: SoftwareDetailsProps) => (
  <div
    className={cn(
      "group/software grid gap-4 p-4 lg:gap-8 lg:p-8",
      "grid-custom-areas grid-cols-[auto_auto]",
      "sm:grid-cols-[0_minmax(200px,_4fr)_1fr_auto_1fr_minmax(200px,_4fr)_0]",
      "lg:grid-cols-[2fr_minmax(200px,_4fr)_1fr_auto_1fr_minmax(200px,_4fr)_2fr]",
      className
    )}
    data-row="software-details"
  >
    {detailItems.map((item) => (
      <DetailItem key={item.id} item={item} />
    ))}

    <div
      className="flex flex-col items-center text-[12rem] sm:text-[clamp(8rem,16vw,12rem)]"
      style={{ gridArea: "pizza" }}
    >
      <Pizza slices={getSlices(detailItems)} />
    </div>
  </div>
)

SoftwareDetails.displayName = "SoftwareDetails"

export default SoftwareDetails

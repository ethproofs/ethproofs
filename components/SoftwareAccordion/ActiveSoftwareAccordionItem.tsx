import { ChevronRight } from "lucide-react"
import { type AccordionItemProps } from "@radix-ui/react-accordion"

import type { ZkvmMetrics } from "@/lib/types"

import Pizza from "../Pizza"
import SoftwareDetails from "../SoftwareDetails"
import { AccordionContent, AccordionTrigger } from "../ui/accordion"
import { ButtonLink } from "../ui/button"

import { ActiveZkvm } from "./ActiveSoftwareAccordion"
import SoftwareAccordionItemLayout from "./SoftwareAccordionItem.layout"

import { formatShortDate } from "@/lib/date"
import { getSoftwareDetailItems } from "@/lib/metrics"
import { getSlices } from "@/lib/zkvms"

export const ActiveSoftwareAccordionItem = ({
  value,
  zkvm,
  metrics,
}: Pick<AccordionItemProps, "value"> & {
  zkvm: ActiveZkvm
  metrics: Partial<ZkvmMetrics> | undefined
}) => {
  const detailItems = getSoftwareDetailItems(metrics)

  return (
    <SoftwareAccordionItemLayout
      value={value}
      zkvm={zkvm}
      trigger={
        <AccordionTrigger className="col-start-8 my-4 h-fit gap-2 rounded-full border-2 border-primary bg-background-highlight p-0.5 pe-2 text-4xl text-primary [&>svg]:size-6">
          <Pizza slices={getSlices(detailItems)} disableEffects />
        </AccordionTrigger>
      }
      content={
        <AccordionContent className="col-span-full border-b p-0">
          <SoftwareDetails detailItems={detailItems} />
          <div className="grid grid-cols-3 gap-16 p-8 pt-0">
            <ButtonLink
              variant="outline"
              href={`/zkvms/${zkvm.slug}`}
              className="col-start-2 mx-auto"
            >
              details for {zkvm.name}
              <ChevronRight className="-mx-2 size-4" />
            </ButtonLink>
            {metrics?.updated_at && (
              <div className="col-start-3 text-end">
                <span className="text-xs text-body-secondary">
                  last updated:
                </span>{" "}
                <span className="text-xs uppercase text-body">
                  {formatShortDate(new Date(metrics.updated_at))}
                </span>
              </div>
            )}
          </div>
        </AccordionContent>
      }
    />
  )
}

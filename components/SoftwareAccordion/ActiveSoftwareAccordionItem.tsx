import { ChevronRight } from "lucide-react"
import { type AccordionItemProps } from "@radix-ui/react-accordion"

import type { ZkvmMetrics } from "@/lib/types"

import { DisplayTeamLink } from "../DisplayTeamLink"
import Pizza from "../Pizza"
import SoftwareDetails from "../SoftwareDetails"
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion"
import { ButtonLink } from "../ui/button"
import Link from "../ui/link"
import { Progress } from "../ui/progress"

import { ActiveZkvm } from "./ActiveSoftwareAccordion"

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
    <AccordionItem value={value} className="col-span-5 grid grid-cols-subgrid">
      <div className="col-span-5 grid grid-cols-subgrid items-center justify-items-center gap-12 text-nowrap border-b p-px px-6 hover:bg-primary/5 dark:hover:bg-primary/10">
        <div className="col-start-1 flex items-center gap-3 justify-self-start">
          <Link
            href={`/zkvms/${zkvm.slug}`}
            className="block text-2xl text-primary hover:text-primary-light hover:underline"
          >
            {zkvm.name}
          </Link>
          <span className="block font-mono text-sm italic text-body-secondary">
            by
          </span>
          <div className="min-w-24">
            <DisplayTeamLink team={zkvm.vendor} className="block" />
          </div>
        </div>
        <div id="version" className="col-start-2">
          {zkvm.versions[0].version}
        </div>
        <div id="isa" className="col-start-3 min-w-14">
          {zkvm.isa}
        </div>
        <div id="used-by" className="relative col-start-4 min-w-16">
          <div className="w-full text-center">
            {zkvm.activeClusters}/
            <span className="text-xs">{zkvm.totalClusters}</span>
          </div>
          <Progress
            value={(zkvm.activeClusters / zkvm.totalClusters) * 100}
            className="absolute -bottom-1 left-0 h-[2px] w-full"
          />
        </div>

        <AccordionTrigger className="col-start-5 my-4 h-fit gap-2 rounded-full border-2 border-primary bg-background-highlight p-0.5 pe-2 text-4xl text-primary [&>svg]:size-6">
          <Pizza slices={getSlices(detailItems)} disableEffects />
        </AccordionTrigger>
      </div>
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
              <span className="text-xs italic text-body-secondary">
                Last updated
              </span>{" "}
              <span className="text-xs uppercase text-body">
                {formatShortDate(new Date(metrics.updated_at))}
              </span>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

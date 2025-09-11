import { Check, X as RedX } from "lucide-react"
import { type AccordionItemProps } from "@radix-ui/react-accordion"

import { DisplayTeamLink } from "../DisplayTeamLink"
import { AccordionItem } from "../ui/accordion"
import Link from "../ui/link"
import { Progress } from "../ui/progress"

import { ActiveZkvm } from "./ActiveSoftwareAccordion"
import { InactiveZkvm } from "./InactiveSoftwareAccordion"

const SoftwareAccordionItemLayout = ({
  value,
  zkvm,
  trigger,
  content,
}: Pick<AccordionItemProps, "value"> & {
  zkvm: ActiveZkvm | InactiveZkvm
  trigger: React.ReactNode
  content?: React.ReactNode
}) => {
  const latestVersion = zkvm.versions.reduce((latest, version) =>
    version.id > latest.id ? version : latest
  )
  return (
    <AccordionItem value={value} className="col-span-8 grid grid-cols-subgrid">
      <div className="col-span-8 grid grid-cols-subgrid items-center justify-items-center gap-12 text-nowrap border-b p-px px-6">
        <div className="col-start-1 flex items-center gap-3 justify-self-start">
          <Link
            href={`/zkvms/${zkvm.slug}`}
            className="block text-2xl text-primary hover:text-primary-light hover:underline"
          >
            {zkvm.name}
          </Link>
          <span className="block text-sm italic text-body-secondary">by</span>
          <div className="min-w-24">
            <DisplayTeamLink team={zkvm.team} className="block" />
          </div>
        </div>
        <div id="is-open-source" className="col-start-2">
          {zkvm.is_open_source ? (
            <Check className="text-level-best" />
          ) : (
            <RedX className="text-level-worst" />
          )}
        </div>
        <div id="dual-licenses" className="col-start-3">
          {zkvm.dual_licenses ? (
            <Check className="text-level-best" />
          ) : (
            <RedX className="text-level-worst" />
          )}
        </div>
        <div id="is-proving-mainnet" className="col-start-4">
          {zkvm.is_proving_mainnet ? (
            <Check className="text-level-best" />
          ) : (
            <RedX className="text-level-worst" />
          )}
        </div>
        <div id="version" className="col-start-5">
          {latestVersion.version || "N/A"}
        </div>
        <div id="isa" className="col-start-6 min-w-14 text-center">
          {zkvm.isa}
        </div>
        <div id="used-by" className="relative col-start-7 min-w-16">
          <div className="w-full text-center">
            {zkvm.activeClusters}/
            <span className="text-xs">{zkvm.totalClusters}</span>
          </div>
          <Progress
            value={
              zkvm.totalClusters > 0
                ? (zkvm.activeClusters / zkvm.totalClusters) * 100
                : 0
            }
            className="absolute -bottom-1 left-0 h-[2px] w-full"
          />
        </div>
        {trigger}
      </div>
      {content}
    </AccordionItem>
  )
}

SoftwareAccordionItemLayout.displayName = "SoftwareAccordionItemLayout"

export default SoftwareAccordionItemLayout

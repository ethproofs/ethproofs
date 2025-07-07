import { Check, X as RedX } from "lucide-react"
import { type AccordionItemProps } from "@radix-ui/react-accordion"

import type { Slices, ZkvmMetrics } from "@/lib/types"

import { DisplayTeamLink } from "../DisplayTeamLink"
import Pizza from "../Pizza"
import { AccordionItem, AccordionTrigger } from "../ui/accordion"
import Link from "../ui/link"
import { Progress } from "../ui/progress"

import { InactiveZkvm } from "./InactiveSoftwareAccordion"

const disabledSlices: Slices = [
  { level: undefined },
  { level: undefined },
  { level: undefined },
  { level: undefined },
  { level: undefined },
  { level: undefined },
  { level: undefined },
  { level: undefined },
]

export const InactiveSoftwareAccordionItem = ({
  value,
  zkvm,
}: Pick<AccordionItemProps, "value"> & {
  zkvm: InactiveZkvm
}) => {
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
          <span className="block font-mono text-sm italic text-body-secondary">
            by
          </span>
          <div className="min-w-24">
            <DisplayTeamLink team={zkvm.vendor} className="block" />
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
          {zkvm.versions[0].version}
        </div>
        <div id="isa" className="col-start-6 min-w-14 text-center">
          {zkvm.isa}
        </div>
        <div id="used-by" className="relative col-start-7 min-w-16">
          <div className="w-full text-center">
            0/
            <span className="text-xs">0</span>
          </div>
          <Progress
            value={0}
            className="absolute -bottom-1 left-0 h-[2px] w-full"
          />
        </div>

        <AccordionTrigger
          disabled
          className="col-start-8 my-4 h-fit gap-2 rounded-full border-2 bg-background-highlight p-0.5 pe-2 text-4xl text-border [&>svg]:size-6"
        >
          <Pizza slices={disabledSlices} disableEffects />
        </AccordionTrigger>
      </div>
    </AccordionItem>
  )
}

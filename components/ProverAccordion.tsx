// TODO: Pass data as props

import { X as RedX } from "lucide-react"
import { type AccordionItemProps } from "@radix-ui/react-accordion"

import type { ClusterDetails, ProverAccordionDetails } from "@/lib/types"

import SuccinctLogo from "@/components/svgs/succinct-logo.svg"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion"
import { MetricBox, MetricInfo, MetricLabel } from "./ui/metric"
import ProverDetails from "./ProverDetails"

import { prettyMs } from "@/lib/time"

type ProverAccordionItemProps = Pick<AccordionItemProps, "value"> & {
  clusterDetails: ClusterDetails[]
}
const ProverAccordionItem = ({
  value,
  clusterDetails,
}: ProverAccordionItemProps) => (
  <AccordionItem value={value} className="col-span-6 grid grid-cols-subgrid">
    <div className="col-span-6 grid grid-cols-subgrid items-center gap-12 border-b px-6 py-4">
      {/* TODO: Update to match design */}
      <div className="col-start-1 flex flex-col gap-1">
        <SuccinctLogo />
        <div>
          <span className="text-sm text-primary">SP1 | </span>
          <span className="text-sm">Cluster name</span>
        </div>
      </div>
      <div id="version" className="col-start-2 flex justify-center">
        <RedX className="text-level-worst" strokeLinecap="square" />
      </div>
      <div id="version" className="col-start-3">
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumSignificantDigits: 2,
        }).format(0.00031)}
      </div>
      <div id="isa" className="col-start-4">
        {prettyMs(164_000)}
      </div>
      <div id="used-by" className="col-start-5">
        {new Intl.NumberFormat("en-US", {
          style: "percent",
        }).format(0.69)}
      </div>

      <AccordionTrigger className="col-start-6 my-2 h-fit gap-2 rounded-full border-2 border-primary-border bg-background-highlight p-0.5 text-primary [&>svg]:size-6" />
    </div>
    <AccordionContent className="col-span-full border-b px-0 py-4">
      <ProverDetails data={clusterDetails} />
    </AccordionContent>
  </AccordionItem>
)

type ProverAccordionProps = {
  provers: ProverAccordionDetails[]
}
const ProverAccordion = ({ provers }: ProverAccordionProps) => (
  <Accordion
    type="multiple"
    className="grid w-full grid-cols-[1fr_repeat(5,_auto)] md:px-6"
  >
    <div className="col-span-6 grid grid-cols-subgrid text-center">
      <MetricBox className="col-start-2">
        <MetricLabel>
          <MetricInfo label="open source">TODO: Popover details</MetricInfo>
        </MetricLabel>
      </MetricBox>
      <MetricBox className="col-start-3">
        <MetricLabel>
          <MetricInfo label="avg cost">
            Instruction set architecture
            <br />
            TODO: Popover details
          </MetricInfo>
        </MetricLabel>
      </MetricBox>
      <MetricBox className="col-start-4">
        <MetricLabel>
          <MetricInfo label="avg time">TODO: Popover details</MetricInfo>
        </MetricLabel>
      </MetricBox>
      <MetricBox className="col-start-5">
        <MetricLabel>
          <MetricInfo label="efficiency">TODO: Popover details</MetricInfo>
        </MetricLabel>
      </MetricBox>
    </div>
    {Array.from({ length: 9 }, (_, i) => (
      <ProverAccordionItem
        key={i}
        value={"item-" + i}
        clusterDetails={provers[0].clusterDetails}
      />
    ))}
  </Accordion>
)

ProverAccordion.displayName = "ProverAccordion"

export default ProverAccordion

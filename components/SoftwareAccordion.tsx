import Image from "next/image"
import { type AccordionItemProps } from "@radix-ui/react-accordion"

import { Vendor, Zkvm, ZkvmVersion } from "@/lib/types"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion"
import { ButtonLink } from "./ui/button"
import Link from "./ui/link"
import { MetricBox, MetricInfo, MetricLabel } from "./ui/metric"
import { Progress } from "./ui/progress"
import Pizza from "./Pizza"
import SoftwareDetails, { DEMO_SLICES } from "./SoftwareDetails"

import { getZkvmsWithUsage } from "@/lib/zkvms"

const SoftwareAccordionItem = ({
  value,
  zkvm,
}: Pick<AccordionItemProps, "value"> & {
  zkvm: Zkvm & {
    versions: ZkvmVersion[]
    vendor: Vendor
    totalClusters: number
    zkvmClusters: number
  }
}) => (
  <AccordionItem value={value} className="col-span-5 grid grid-cols-subgrid">
    <div className="col-span-5 grid grid-cols-subgrid items-center gap-12 border-b hover:bg-primary/5 dark:hover:bg-primary/10">
      <div className="col-start-1 flex items-center gap-3">
        <Link href="/zkvm/#TODO-zkvm-id" className="hover:underline">
          <span className="block font-mono text-2xl text-primary">
            {zkvm.name}
          </span>
        </Link>
        <span className="block font-mono text-sm italic text-body-secondary">
          by
        </span>
        <Link
          href="/prover/#TODO-prover-id"
          className="-m-1 rounded p-1 hover:bg-primary/10"
        >
          <Image
            // TODO: add fallback logo
            src={zkvm.vendor.logo_url ?? ""}
            alt="Succinct logo"
            height={16}
            width={16}
            style={{ height: "1rem", width: "auto" }}
            className="dark:invert"
          />
        </Link>
      </div>
      <div id="version" className="col-start-2">
        {zkvm.versions[0].version}
      </div>
      <div id="isa" className="col-start-3">
        {zkvm.isa}
      </div>
      <div id="used-by" className="relative col-start-4 min-w-16">
        <div className="w-full text-center">
          {zkvm.zkvmClusters}/
          <span className="text-xs">{zkvm.totalClusters}</span>
        </div>
        <Progress
          value={(zkvm.zkvmClusters / zkvm.totalClusters) * 100}
          className="absolute -bottom-1 left-0 h-[2px] w-full"
        />
      </div>

      <AccordionTrigger className="col-start-5 my-2 h-fit gap-2 rounded-full border-2 border-primary-border bg-background-highlight p-0.5 text-primary [&>svg]:size-6">
        <Pizza slices={DEMO_SLICES} disableEffects />
      </AccordionTrigger>
    </div>
    <AccordionContent className="col-span-full border-b bg-gradient-to-b from-background to-background-active p-0">
      <SoftwareDetails />

      <div className="flex justify-center gap-16 p-8 pt-0">
        <ButtonLink variant="outline" href="/zkvm/#TODO-zkvm-id">
          See all details
        </ButtonLink>
        <div>
          <span className="text-xs italic text-body-secondary">
            Last updated
          </span>{" "}
          <span className="text-xs uppercase text-body">
            {/* // TODO: Get and use last updated date */}
            {new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            }).format(Date.now())}
          </span>
        </div>
      </div>
    </AccordionContent>
  </AccordionItem>
)
const SoftwareAccordion = async () => {
  const zkvms = await getZkvmsWithUsage()

  return (
    <Accordion
      type="multiple"
      className="grid w-full grid-cols-[1fr_repeat(4,_auto)]"
    >
      <div className="col-span-5 grid grid-cols-subgrid text-center">
        <MetricBox className="col-start-2">
          <MetricLabel>
            <MetricInfo label="Version">TODO: Popover details</MetricInfo>
          </MetricLabel>
        </MetricBox>
        <MetricBox className="col-start-3">
          <MetricLabel>
            <MetricInfo label="ISA">
              Instruction set architecture
              <br />
              TODO: Popover details
            </MetricInfo>
          </MetricLabel>
        </MetricBox>
        <MetricBox className="col-start-4">
          <MetricLabel>
            <MetricInfo label="Used by">TODO: Popover details</MetricInfo>
          </MetricLabel>
        </MetricBox>
      </div>
      {zkvms.map((zkvm) => (
        <SoftwareAccordionItem
          key={zkvm.id}
          value={"item-" + zkvm.id}
          zkvm={zkvm}
        />
      ))}
    </Accordion>
  )
}

SoftwareAccordion.displayName = "SoftwareAccordion"

export default SoftwareAccordion

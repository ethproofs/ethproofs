// TODO: Pass data as props

import { Fragment } from "react"
import { Check, X as RedX } from "lucide-react"
import Image from "next/image"
import { type AccordionItemProps } from "@radix-ui/react-accordion"

import type { ClusterDetails } from "@/lib/types"

import { cn } from "@/lib/utils"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion"
import { ButtonLink } from "./ui/button"
import Link from "./ui/link"
import { MetricBox, MetricInfo, MetricLabel } from "./ui/metric"
import HardwareGrid, { GRID_CELL_BG_SPECTRUM } from "./HardwareGrid"

import { formatUsd } from "@/lib/number"
import { prettyMs } from "@/lib/time"

type ClusterAccordionItemProps = Pick<AccordionItemProps, "value"> & {
  clusterDetails: ClusterDetails
}
const ClusterAccordionItem = ({
  value,
  clusterDetails,
}: ClusterAccordionItemProps) => (
  <AccordionItem value={value} className="col-span-6 grid grid-cols-subgrid">
    <div className="col-span-6 grid grid-cols-subgrid items-center gap-12 px-6 py-4 hover:bg-primary/5 dark:hover:bg-primary/10">
      {/* TODO: Update to match design */}
      <div className="col-start-1 flex flex-col gap-1">
        <Link
          href={`/prover/${clusterDetails.proverId}`}
          className="-m-1 w-fit rounded p-1 hover:bg-primary/10"
        >
          {clusterDetails.proverLogo ? (
            <Image
              src={clusterDetails.proverLogo}
              alt="Prover logo"
              height={16}
              width={16}
              style={{ height: "1rem", width: "auto" }}
              className="dark:invert"
            />
          ) : (
            <div className="flex items-center gap-1">
              <div className="size-4 rounded-full bg-primary-border" />
              {clusterDetails.proverName}
            </div>
          )}
        </Link>
        <div>
          <span className="text-sm text-primary">
            <Link
              href={`/zkvms/${clusterDetails.zkvmId}`}
              className="hover:underline"
            >
              {clusterDetails.zkvmName}
            </Link>{" "}
            |{" "}
          </span>
          <span className="text-sm">{clusterDetails.clusterName}</span>
        </div>
      </div>
      <div id="version" className="col-start-2 flex justify-center">
        {clusterDetails.isOpenSource ? (
          <Check className="text-level-best" strokeLinecap="square" />
        ) : (
          <RedX className="text-level-worst" strokeLinecap="square" />
        )}
      </div>
      <div id="version" className="col-start-3">
        {formatUsd(clusterDetails.avgCost)}
      </div>
      <div id="isa" className="col-start-4">
        {prettyMs(clusterDetails.avgTime)}
      </div>

      <AccordionTrigger className="col-start-6 my-2 h-fit gap-2 rounded-full border-2 border-primary-border bg-background-highlight p-0.5 text-primary [&>svg]:size-6" />
    </div>
    <AccordionContent className="col-span-full flex flex-col gap-12 p-6">
      <div className="flex items-center gap-x-20">
        <div className="flex flex-col items-center gap-y-6 text-center">
          <div className="flex w-fit flex-col items-center text-nowrap px-2 text-center">
            <span className="block text-nowrap text-sm text-body-secondary">
              total machines
            </span>
            <span className="block font-mono text-2xl font-bold text-body">
              {clusterDetails.machines.reduce(
                (acc, curr) => acc + curr.count,
                0
              )}
            </span>
          </div>
          <div className="grid grid-cols-2 place-items-center gap-x-3 gap-y-4 text-center">
            <div className="flex w-full flex-col items-center text-nowrap text-center">
              <span className="block text-sm text-body-secondary">GPUs</span>
              <span className="block font-mono text-xl text-body">
                {clusterDetails.machines.reduce(
                  (acc, curr) => acc + curr.gpuCount,
                  0
                )}
              </span>
            </div>
            <div className="flex w-full flex-col items-center text-nowrap text-center">
              <span className="block text-sm text-body-secondary">GPU RAM</span>
              <span className="block font-mono text-xl text-body">
                {clusterDetails.machines.reduce(
                  (acc, curr) => acc + curr.gpuRam,
                  0
                )}{" "}
                GB
              </span>
            </div>
            <div className="flex flex-col items-center text-nowrap text-center">
              <span className="block text-sm text-body-secondary">
                CPU cores
              </span>
              <span className="block font-mono text-xl text-body">
                {clusterDetails.machines.reduce(
                  (acc, curr) => acc + curr.cpuCount,
                  0
                )}
              </span>
            </div>
            <div className="flex flex-col items-center text-nowrap text-center">
              <span className="block text-sm text-body-secondary">CPU RAM</span>
              <span className="block font-mono text-xl text-body">
                {clusterDetails.machines.reduce(
                  (acc, curr) => acc + curr.cpuRam,
                  0
                )}{" "}
                GB
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col space-y-4 overflow-x-hidden">
          <HardwareGrid cluster={clusterDetails} />
          <div className="flex items-center gap-3 self-end">
            <span className="me-4">GPUs</span>
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Fragment key={i}>
                  <span className="-me-1">{2 ** i}</span>
                  <div
                    key={i}
                    className={cn(
                      "size-4 rounded-[4px]",
                      GRID_CELL_BG_SPECTRUM[
                        (i + 1) % GRID_CELL_BG_SPECTRUM.length
                      ]
                    )}
                  />
                </Fragment>
              ))}
          </div>
        </div>
      </div>

      <div className="grid place-items-center">
        <ButtonLink
          variant="outline"
          href={`/prover/${clusterDetails.proverId}`}
        >
          See all details
        </ButtonLink>
      </div>
    </AccordionContent>
  </AccordionItem>
)

type ClusterAccordionProps = {
  clusters: ClusterDetails[]
}
const ClusterAccordion = ({ clusters }: ClusterAccordionProps) => (
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
    </div>
    {clusters.map((cluster, i) => (
      <ClusterAccordionItem
        key={i}
        value={"item-" + i}
        clusterDetails={cluster}
      />
    ))}
  </Accordion>
)

ClusterAccordion.displayName = "ClusterAccordion"

export default ClusterAccordion

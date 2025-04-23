// TODO: Pass data as props

import { Fragment } from "react"
import { X as RedX } from "lucide-react"
import prettyBytes from "pretty-bytes"
import { type AccordionItemProps } from "@radix-ui/react-accordion"

import type { ClusterDetails, ProverAccordionDetails } from "@/lib/types"

import SuccinctLogo from "@/components/svgs/succinct-logo.svg"

import { cn } from "@/lib/utils"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion"
import { MetricBox, MetricInfo, MetricLabel } from "./ui/metric"
import HardwareGrid, { GRID_CELL_BG_SPECTRUM } from "./HardwareGrid"

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
      <div className="flex items-center gap-x-20">
        <div className="flex flex-col items-center gap-y-6 p-4 text-center">
          <div className="flex w-fit flex-col items-center text-nowrap px-2 text-center">
            <span className="block text-nowrap text-sm text-body-secondary">
              total machines
            </span>
            <span className="block font-mono text-2xl text-body">
              {clusterDetails.length}
            </span>
          </div>
          <div className="grid grid-cols-2 place-items-center gap-x-3 gap-y-4 text-center">
            <div className="flex w-full flex-col items-center text-nowrap text-center">
              <span className="block text-sm text-body-secondary">GPUs</span>
              <span className="block font-mono text-2xl text-body">
                {clusterDetails.reduce((acc, curr) => acc + curr.gpuCount, 0)}
              </span>
            </div>
            <div className="flex w-full flex-col items-center text-nowrap text-center">
              <span className="block text-sm text-body-secondary">GPU RAM</span>
              <span className="block font-mono text-2xl text-body">
                {prettyBytes(
                  clusterDetails.reduce(
                    (acc, curr) =>
                      acc +
                      curr.machines.reduce(
                        (machineAcc, machine) =>
                          machineAcc + Number(machine.gpuRam),
                        0
                      ),
                    0
                  )
                )}
              </span>
            </div>
            <div className="flex flex-col items-center text-nowrap text-center">
              <span className="block text-sm text-body-secondary">
                CPU cores
              </span>
              <span className="block font-mono text-2xl text-body">
                {clusterDetails.reduce(
                  (acc, curr) =>
                    acc +
                    curr.machines.reduce(
                      (machineAcc, machine) =>
                        machineAcc + Number(machine.cpuCount),
                      0
                    ),
                  0
                )}
              </span>
            </div>
            <div className="flex flex-col items-center text-nowrap text-center">
              <span className="block text-sm text-body-secondary">CPU RAM</span>
              <span className="block font-mono text-2xl text-body">
                {/* TODO: Add then replace with **CPU** RAM */}
                {prettyBytes(
                  clusterDetails.reduce(
                    (acc, curr) =>
                      acc +
                      curr.machines.reduce(
                        (machineAcc, machine) =>
                          machineAcc + Number(machine.gpuRam),
                        0
                      ),
                    0
                  )
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col space-y-4 overflow-x-hidden">
          <HardwareGrid data={clusterDetails} />
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

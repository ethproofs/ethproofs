import { Fragment } from "react"
import { Check, ChevronRight, X as RedX } from "lucide-react"
import { type AccordionItemProps } from "@radix-ui/react-accordion"

import type {
  ClusterBase,
  ClusterMachineBase,
  ClusterVersionBase,
  MachineBase,
  Team,
  Zkvm,
  ZkvmVersion,
} from "@/lib/types"

import { cn } from "@/lib/utils"

import { getBoxIndexColor } from "./HardwareGrid/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion"
import { ButtonLink } from "./ui/button"
import Link from "./ui/link"
import { MetricBox, MetricInfo, MetricLabel } from "./ui/metric"
import { TooltipContentHeader } from "./ui/tooltip"
import ClusterMachineSummary from "./ClusterMachineSummary"
import { DisplayTeamLink } from "./DisplayTeamLink"
import HardwareGrid from "./HardwareGrid"
import NoData from "./NoData"

import { hasPhysicalMachines, isMultiMachineCluster } from "@/lib/clusters"
import { formatShortDate } from "@/lib/date"
import { formatUsd } from "@/lib/number"
import { prettyMs } from "@/lib/time"

export type ClusterWithRelations = ClusterBase & {
  team: Team
  versions: Array<
    ClusterVersionBase & {
      zkvm_version: ZkvmVersion & {
        zkvm: Zkvm
      }
      cluster_machines: Array<
        ClusterMachineBase & {
          machine: MachineBase
        }
      >
    }
  >
}

type ClusterAccordionItemProps = Pick<AccordionItemProps, "value"> & {
  clusterDetails: ClusterWithRelations & { avg_cost: number; avg_time: number }
}
const ClusterAccordionItem = ({
  value,
  clusterDetails,
}: ClusterAccordionItemProps) => {
  const lastVersion = clusterDetails.versions[0]

  if (!lastVersion) {
    throw new Error("No cluster version found")
  }

  const hasPhysicalMachinesInCluster = hasPhysicalMachines(
    lastVersion.cluster_machines
  )

  const isMultiMachine = isMultiMachineCluster(lastVersion.cluster_machines)

  return (
    <AccordionItem
      value={value}
      className="col-span-6 grid grid-cols-subgrid text-nowrap"
    >
      <div className="col-span-6 grid grid-cols-subgrid items-center gap-12 px-6 py-4 hover:bg-primary/5 dark:hover:bg-primary/10">
        <div className="col-start-1 flex flex-col gap-1">
          <Link
            href={`/clusters/${clusterDetails.id}`}
            className="text-xl text-primary hover:text-primary-light hover:underline"
          >
            {clusterDetails.nickname}
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Link
              href={`/zkvms/${lastVersion.zkvm_version.zkvm.slug}`}
              className="block hover:text-primary-light hover:underline"
            >
              {lastVersion.zkvm_version.zkvm.name}
            </Link>{" "}
            <span className="font-mono text-sm italic text-body-secondary">
              by
            </span>{" "}
            <div className="min-w-24">
              <DisplayTeamLink
                team={clusterDetails.team}
                className="block"
                height={14}
              />
            </div>
          </div>
        </div>
        <div className="col-start-2 flex justify-center">
          {clusterDetails.is_open_source ? (
            <Check className="text-level-best" strokeLinecap="square" />
          ) : (
            <RedX className="text-level-worst" strokeLinecap="square" />
          )}
        </div>
        <div className="col-start-3 flex justify-center">
          {clusterDetails.software_link ? (
            <Check className="text-level-best" strokeLinecap="square" />
          ) : (
            <RedX className="text-level-worst" strokeLinecap="square" />
          )}
        </div>
        <div className="col-start-4">{formatUsd(clusterDetails.avg_cost)}</div>
        <div className="col-start-5">{prettyMs(clusterDetails.avg_time)}</div>

        <AccordionTrigger className="relative col-start-6 my-2 h-fit gap-2 rounded-full border-2 border-primary bg-background-highlight p-1 text-primary [&>svg]:size-6">
          <span className="sr-only">Toggle details</span>
        </AccordionTrigger>
      </div>
      <AccordionContent className="relative col-span-full flex flex-col gap-12 p-6">
        {hasPhysicalMachinesInCluster ? (
          <div className="flex items-center gap-x-20">
            <ClusterMachineSummary machines={lastVersion.cluster_machines} />

            {isMultiMachine && (
              <div className="flex flex-1 flex-col space-y-4 overflow-x-hidden">
                <HardwareGrid clusterMachines={lastVersion.cluster_machines} />
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
                            getBoxIndexColor(i)
                          )}
                        />
                      </Fragment>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex min-h-[80px] items-center justify-center text-body-secondary">
            No hardware specifications available.
          </div>
        )}

        <div className="grid place-items-center">
          <ButtonLink variant="outline" href={`/clusters/${clusterDetails.id}`}>
            details for {clusterDetails.nickname}
            <ChevronRight className="-mx-2 size-4" />
          </ButtonLink>
        </div>

        <div className="absolute bottom-6 right-6">
          <span className="text-xs italic text-body-secondary">
            Last updated
          </span>{" "}
          <span className="text-xs uppercase text-body">
            {formatShortDate(new Date(lastVersion.created_at))}
          </span>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

type ClusterAccordionProps = {
  clusters: (ClusterWithRelations & { avg_cost: number; avg_time: number })[]
}
const ClusterAccordion = ({ clusters }: ClusterAccordionProps) => (
  <Accordion
    type="multiple"
    className="grid w-full grid-cols-[1fr_repeat(5,_auto)] overflow-x-auto"
  >
    {clusters.length ? (
      <>
        <div className="col-span-6 grid grid-cols-subgrid text-center">
          <MetricBox className="col-start-2">
            <MetricLabel>
              <MetricInfo label="open source">
                <TooltipContentHeader>open source</TooltipContentHeader>
                Indicates whether the zkVM is open source or not
              </MetricInfo>
            </MetricLabel>
          </MetricBox>
          <MetricBox className="col-start-3">
            <MetricLabel>
              <MetricInfo label="binary available">
                <TooltipContentHeader>binary available</TooltipContentHeader>
                Indicates whether the necessary zkVM binary is available for
                verification. This binary contains the compiled circuit and
                verification keys essential for validating proofs
              </MetricInfo>
            </MetricLabel>
          </MetricBox>
          <MetricBox className="col-start-4">
            <MetricLabel>
              <MetricInfo label="avg cost">
                <TooltipContentHeader>average cost</TooltipContentHeader>
                Is calculated by multiplying the hourly cloud rate for
                equivalent hardware by the number of instances used, then
                multiplying by proof generation time (converted from
                milliseconds to hours by dividing by 3,600,000)
              </MetricInfo>
            </MetricLabel>
          </MetricBox>
          <MetricBox className="col-start-5">
            <MetricLabel>
              <MetricInfo label="avg time">
                <TooltipContentHeader>average time</TooltipContentHeader>
                <p>
                  Is the average duration of computation time during the proof
                  generation process, self reported by proving teams in
                  milliseconds
                </p>
                <p className="text-sm">Time spent generating proof of execution</p>
              </MetricInfo>
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
      </>
    ) : (
      <NoData />
    )}
  </Accordion>
)

ClusterAccordion.displayName = "ClusterAccordion"

export default ClusterAccordion

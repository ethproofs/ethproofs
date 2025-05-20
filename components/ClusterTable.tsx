import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

import { ButtonLink } from "./ui/button"
import Link from "./ui/link"
import { MetricBox, MetricInfo, MetricLabel } from "./ui/metric"
import { TooltipContentHeader } from "./ui/tooltip"
import { ClusterWithRelations } from "./ClusterAccordion"
import NoData from "./NoData"

import { formatShortDate } from "@/lib/date"

type ClusterRowItemProps = { cluster: ClusterWithRelations }

const ClusterRowItem = ({ cluster }: ClusterRowItemProps) => (
  <div className="col-span-full row-span-2 grid grid-cols-subgrid grid-rows-subgrid border-b border-primary-border">
    <div className="row-span-2 grid grid-cols-1 grid-rows-subgrid px-6 py-4">
      <div className="text-lg">{cluster.nickname}</div>
      <div className="mt-auto text-xs">
        <span className="italic text-body-secondary">updated</span>{" "}
        <span className="uppercase">
          {formatShortDate(new Date(cluster.versions[0].created_at))}
        </span>
      </div>
    </div>
    <div className="row-span-2 grid grid-cols-1 grid-rows-subgrid px-6 py-4 text-center">
      <MetricBox className="py-0">
        <MetricLabel>
          <MetricInfo label="zkVM">
            <TooltipContentHeader>
              zero-knowledge virtual machine
            </TooltipContentHeader>
            The virtual machine implementation used by this cluster to generate
            zero-knowledge proofs
          </MetricInfo>
        </MetricLabel>
      </MetricBox>
      <Link href={`/zkvms/${cluster.versions[0].zkvm_version.zkvm.slug}`}>
        {cluster.versions[0].zkvm_version.zkvm.name}
      </Link>
    </div>
    <div className="row-span-2 grid grid-cols-1 grid-rows-subgrid px-6 py-4 text-center">
      <MetricBox className="py-0">
        <MetricLabel>
          <MetricInfo label="ISA">
            <TooltipContentHeader>
              instruction set architecture
            </TooltipContentHeader>
            Defines the instruction set this zkVM implements to generate
            zero-knowledge proofs for Ethereum transactions. The ISA determines
            which EVM operations can be efficiently proven and verified on-chain
          </MetricInfo>
        </MetricLabel>
      </MetricBox>
      <div className="">{cluster.versions[0].zkvm_version.zkvm.isa}</div>
    </div>
    <div className="row-span-2 grid grid-cols-1 grid-rows-subgrid px-6 py-4 text-center">
      <MetricBox className="py-0">
        <MetricLabel>
          <MetricInfo label="proof type">
            <TooltipContentHeader>
              zero-knowledge proof system
            </TooltipContentHeader>
            The cryptographic protocol used to generate and verify
            zero-knowledge proofs
          </MetricInfo>
        </MetricLabel>
      </MetricBox>
      <div className="">{cluster.proof_type}</div>
    </div>
    <div className="row-span-2 grid grid-cols-1 place-items-center px-6 py-4">
      <ButtonLink
        size="icon"
        variant="outline"
        className="h-fit bg-background-highlight p-1"
        href={`/clusters/${cluster.id}`}
      >
        <ChevronRight />
      </ButtonLink>
    </div>
  </div>
)

type ClusterTableProps = React.HTMLAttributes<HTMLDivElement> & {
  clusters: ClusterWithRelations[]
}

const ClusterTable = ({ className, clusters, ...props }: ClusterTableProps) => (
  <div
    className={cn("grid w-full grid-cols-[1fr_repeat(4,_auto)]", className)}
    {...props}
  >
    {clusters.length ? (
      clusters.map((cluster) => (
        <ClusterRowItem key={cluster.id} cluster={cluster} />
      ))
    ) : (
      <NoData>for this set of machines</NoData>
    )}
  </div>
)

ClusterTable.displayName = "ClusterTable"

export default ClusterTable

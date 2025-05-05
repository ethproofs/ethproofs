import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

import { ButtonLink } from "./ui/button"
import Link from "./ui/link"
import { MetricBox, MetricInfo, MetricLabel } from "./ui/metric"

import { ActiveCluster } from "@/lib/clusters"
import { formatShortDate } from "@/lib/date"

type ClusterRowItemProps = { cluster: ActiveCluster }

const ClusterRowItem = ({ cluster }: ClusterRowItemProps) => (
  <div className="col-span-full row-span-2 grid grid-cols-subgrid grid-rows-subgrid border-b border-primary-border">
    <div className="row-span-2 grid grid-cols-1 grid-rows-subgrid px-6 py-4">
      <div className="text-lg">{cluster.nickname}</div>
      <div className="mt-auto text-xs">
        <span className="italic text-body-secondary">updated</span>{" "}
        <span className="uppercase">
          {formatShortDate(new Date(cluster.version.createdAt))}
        </span>
      </div>
    </div>
    <div className="row-span-2 grid grid-cols-1 grid-rows-subgrid px-6 py-4 text-center">
      <MetricBox className="py-0">
        <MetricLabel>
          <MetricInfo label="zkVM">TODO: Popover details</MetricInfo>
        </MetricLabel>
      </MetricBox>
      <Link href={`/zkvms/${cluster.zkvm.slug}`}>{cluster.zkvm.name}</Link>
    </div>
    <div className="row-span-2 grid grid-cols-1 grid-rows-subgrid px-6 py-4 text-center">
      <MetricBox className="py-0">
        <MetricLabel>
          <MetricInfo label="ISA">
            Instruction Set Architecture
            <br />
            TODO: Popover details
          </MetricInfo>
        </MetricLabel>
      </MetricBox>
      <div className="">{cluster.zkvm.isa}</div>
    </div>
    <div className="row-span-2 grid grid-cols-1 grid-rows-subgrid px-6 py-4 text-center">
      <MetricBox className="py-0">
        <MetricLabel>
          <MetricInfo label="proof type">TODO: Popover details</MetricInfo>
        </MetricLabel>
      </MetricBox>
      <div className="">{cluster.proofType}</div>
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
  clusters: ActiveCluster[]
}

const ClusterTable = ({ className, clusters, ...props }: ClusterTableProps) => (
  <div
    className={cn("grid w-full grid-cols-[1fr_repeat(4,_auto)]", className)}
    {...props}
  >
    {clusters.map((cluster) => (
      <ClusterRowItem key={cluster.id} cluster={cluster} />
    ))}
  </div>
)

ClusterTable.displayName = "ClusterTable"

export default ClusterTable

import { ChevronRight } from "lucide-react"

import type { ClusterBase } from "@/lib/types"

import { cn } from "@/lib/utils"

import { ButtonLink } from "./ui/button"
import Link from "./ui/link"
import { MetricBox, MetricInfo, MetricLabel } from "./ui/metric"

type ClusterRowItemProps = { cluster: ClusterBase }

const ClusterRowItem = ({ cluster }: ClusterRowItemProps) => (
  <div className="col-span-full row-span-2 grid grid-cols-subgrid grid-rows-subgrid border-b border-primary-border">
    <div className="row-span-2 grid grid-cols-1 grid-rows-subgrid px-6 py-4">
      <div className="text-lg">{cluster.nickname}</div>
      <div className="mt-auto text-xs">
        <span className="italic text-body-secondary">updated</span>{" "}
        <span className="uppercase">
          {new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "2-digit",
          }).format(new Date(cluster.created_at).getTime())}
        </span>
      </div>
    </div>
    <div className="row-span-2 grid grid-cols-1 grid-rows-subgrid px-6 py-4 text-center">
      <MetricBox className="py-0">
        <MetricLabel>
          <MetricInfo label="zkVM">TODO: Popover details</MetricInfo>
        </MetricLabel>
      </MetricBox>
      <Link href={`/zkvm/TODO-get-name-and-link`}>SP1</Link>
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
      <div className="">{cluster.cycle_type}</div>
    </div>
    <div className="row-span-2 grid grid-cols-1 grid-rows-subgrid px-6 py-4 text-center">
      <MetricBox className="py-0">
        <MetricLabel>
          <MetricInfo label="proof type">TODO: Popover details</MetricInfo>
        </MetricLabel>
      </MetricBox>
      <div className="">{cluster.proof_type}</div>
    </div>
    <div className="row-span-2 grid grid-cols-1 place-items-center px-6 py-4">
      <ButtonLink
        size="icon"
        variant="outline"
        className="h-fit bg-background-highlight p-1"
        href={`/cluster/${cluster.id}`}
      >
        <ChevronRight />
      </ButtonLink>
    </div>
  </div>
)

type ClusterTableProps = React.HTMLAttributes<HTMLDivElement> & {
  clusters: ClusterBase[]
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

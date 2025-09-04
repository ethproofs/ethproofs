import type {
  ClusterBase,
  ClusterMachineBase,
  ClusterVersionBase,
  MachineBase,
  Team,
  Zkvm,
  ZkvmVersion,
} from "@/lib/types"

import NoData from "../NoData"
import { MetricBox, MetricInfo, MetricLabel } from "../ui/metric"

import BenchmarksListItem from "./BenchmarksListItem"

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

type BenchmarksListProps = {
  clusters: ClusterWithRelations[]
}
const BenchmarksList = ({ clusters }: BenchmarksListProps) => (
  <div className="grid w-full grid-cols-[1fr_repeat(5,_auto)] overflow-x-auto">
    {clusters.length ? (
      <>
        <div className="col-span-6 grid grid-cols-subgrid text-center">
          <MetricBox className="col-start-2">
            <MetricLabel>
              <MetricInfo label="fork"></MetricInfo>
            </MetricLabel>
          </MetricBox>
          <MetricBox className="col-start-3">
            <MetricLabel>
              <MetricInfo label="gas limit"></MetricInfo>
            </MetricLabel>
          </MetricBox>
          <MetricBox className="col-start-4">
            <MetricLabel>
              <MetricInfo label="version"></MetricInfo>
            </MetricLabel>
          </MetricBox>
          <MetricBox className="col-start-5">
            <MetricLabel>
              <MetricInfo label="killers"></MetricInfo>
            </MetricLabel>
          </MetricBox>
        </div>

        {clusters.map((cluster, i) => (
          <BenchmarksListItem key={i} clusterDetails={cluster} />
        ))}
      </>
    ) : (
      <NoData />
    )}
  </div>
)

BenchmarksList.displayName = "BenchmarksList"

export default BenchmarksList

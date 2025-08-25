import { ArrowRight } from "lucide-react"

import { DisplayTeamLink } from "../DisplayTeamLink"
import { ButtonLink } from "../ui/button"

import { ClusterWithRelations } from "./BenchmarksList"

type BenchmarksRowLayoutProps = {
  clusterDetails: ClusterWithRelations
}
const BenchmarksListItem = ({ clusterDetails }: BenchmarksRowLayoutProps) => {
  const lastVersion = clusterDetails.versions[0]

  if (!lastVersion) {
    throw new Error("No cluster version found")
  }

  return (
    <div className="col-span-6 grid grid-cols-subgrid items-center gap-12 text-nowrap px-6 py-4 transition-colors hover:bg-primary/5 dark:hover:bg-primary/10">
      <div className="col-start-1 flex flex-col gap-1">
        <div className="text-xl text-primary hover:text-primary-light">
          {clusterDetails.nickname}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="block">{lastVersion.zkvm_version.zkvm.name}</span>
          <span className="font-mono text-sm italic text-body-secondary">
            by
          </span>
          <div className="min-w-24">
            <DisplayTeamLink
              team={clusterDetails.team}
              className="block"
              height={14}
            />
          </div>
        </div>
      </div>
      <div className="col-start-2 flex justify-center">prague</div>
      <div className="col-start-3 flex justify-center">45M</div>
      <div className="col-start-4">v5.1.0</div>
      <div className="col-start-5">24</div>
      <ButtonLink
        href={`/benchmarks/${clusterDetails.id}`}
        variant="outline"
        size="icon"
        className="ms-auto h-auto p-1.5 text-lg"
      >
        <ArrowRight />
      </ButtonLink>
    </div>
  )
}

export default BenchmarksListItem

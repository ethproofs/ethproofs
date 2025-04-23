import type { ClusterDetails } from "@/lib/types"

import { cn } from "@/lib/utils"

import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { PRIMARY_SPECTRUM_BG_COLORS } from "./ProverAccordion"

type ProverDetailsProps = React.ComponentProps<"div"> & {
  data: ClusterDetails[]
}

const ProverDetails = ({ data, className }: ProverDetailsProps) => {
  const getColor = (value: number) => {
    const index =
      value >= 2 ? Math.floor(Math.log2(value)) + 1 : value === 1 ? 1 : 0
    return PRIMARY_SPECTRUM_BG_COLORS[index]
  }

  return (
    <div
      className={cn("grid w-fit grid-rows-5 gap-1", className)}
      style={{ gridAutoFlow: "column" }}
    >
      {data.map(({ clusterName, gpuCount, machines }, index) => (
        <Popover key={index}>
          <PopoverTrigger>
            <div className={cn("size-6 rounded-[4px]", getColor(gpuCount))} />
          </PopoverTrigger>
          <PopoverContent className="flex flex-col gap-y-3 p-4">
            <span className="block text-center font-mono text-lg uppercase text-body">
              {clusterName}
            </span>
            {machines.map(({ machineName, cpuCount, gpuRam }, idx) => (
              <div
                key={machineName + idx}
                className="flex flex-col items-center"
              >
                <span className="text-center font-mono text-lg text-primary">
                  {machineName}
                </span>
                <div className="flex gap-x-3 text-center text-sm">
                  <div className="flex min-w-24 flex-1 flex-col items-center">
                    <div className="text-nowrap text-body-secondary">
                      CPU cores
                    </div>
                    <div className="">{cpuCount}</div>
                  </div>
                  <div className="flex min-w-24 flex-1 flex-col items-center">
                    <div className="text-nowrap text-body-secondary">
                      GPU RAM
                    </div>
                    <div className="">{gpuRam}</div>
                  </div>
                </div>
              </div>
            ))}
          </PopoverContent>
        </Popover>
      ))}
      {Array(128 - data.length)
        .fill(0)
        .map((_, i) => (
          <div key={i} className={cn("size-6 rounded-[4px]", getColor(0))} />
        ))}
    </div>
  )
}

ProverDetails.displayName = "ProverDetails"

export default ProverDetails

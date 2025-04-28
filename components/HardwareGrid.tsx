import type { ClusterDetails } from "@/lib/types"

import { cn } from "@/lib/utils"

import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

export const GRID_CELL_BG_SPECTRUM: string[] = [
  "bg-body-secondary/[5%]",
  "bg-primary/10",
  "bg-primary/20",
  "bg-primary/40",
  "bg-primary/60",
  "bg-primary/80",
  "bg-primary/100",
]

type ProverDetailsProps = React.ComponentProps<"div"> & {
  cluster: ClusterDetails
}

const HardwareGrid = ({ cluster, className }: ProverDetailsProps) => {
  const getColor = (value: number) => {
    const index =
      value >= 2 ? Math.floor(Math.log2(value)) + 1 : value === 1 ? 1 : 0
    return GRID_CELL_BG_SPECTRUM[index]
  }

  return (
    <div
      className={cn("grid w-fit grid-rows-5 gap-1", className)}
      style={{ gridAutoFlow: "column" }}
    >
      {/* {cluster.map(({ clusterName, gpuCount, machines }, index) => (
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
      {Array(2 ** 8 - data.length)
        .fill(0)
        .map((_, i) => (
          <div key={i} className={cn("size-6 rounded-[4px]", getColor(0))} />
        ))} */}
    </div>
  )
}

HardwareGrid.displayName = "HardwareGrid"

export default HardwareGrid

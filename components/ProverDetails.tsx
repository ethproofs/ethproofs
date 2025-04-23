import { cn } from "@/lib/utils"

const DUMMY_DATA: number[] = [2, 8, 8, 4, 1, 16, 32, 8, 8, 4]

// TODO: Accept details as props
type ClusterDetails = {
  gpuCount: number
  clusterName: string
  machine: {
    machineName: string
    cpuCount: number
    gpuRam: string
  }[]
}

type ProverDetailsProps = React.ComponentProps<"div"> &{
  data?: ClusterDetails[]
}
const ProverDetails = ({ data, className }: ProverDetailsProps) => {
  const COLORS: string[] = [
    "bg-primary/[2%]",
    "bg-primary/10",
    "bg-primary/20",
    "bg-primary/40",
    "bg-primary/60",
    "bg-primary/80",
    "bg-primary/100",
  ]

  const getColor = (value: number) => {
    const index =
      value >= 2 ? Math.floor(Math.log2(value)) + 1 : value === 1 ? 1 : 0
    return COLORS[index]
  }

  const dummyFull = [...DUMMY_DATA, ...Array(100 - DUMMY_DATA.length).fill(0)]

  return (
    <div className={cn("grid grid-rows-5 gap-2", className)} style={{ gridAutoFlow: "column" }}>
      {dummyFull.map((value, index) => (
        <div key={index} className={cn("size-8 rounded-[4px]", getColor(value))} />
      ))}
    </div>
  )
}

ProverDetails.displayName = "ProverDetails"

export default ProverDetails

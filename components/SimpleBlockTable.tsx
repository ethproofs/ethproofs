import { columns } from "./blocks-table/columns"
import DataTableUncontrolled from "./ui/data-table-uncontrolled-old"

import { fetchBlocks, MachineType } from "@/lib/api/blocks"
import { getTeams } from "@/lib/api/teams"
import { mergeBlocksWithTeams } from "@/lib/blocks"

type Props = {
  className?: string
  machineType: MachineType
}

const SimpleBlocksTable = async ({ className, machineType }: Props) => {
  const teams = await getTeams()
  const blocks = await fetchBlocks(machineType, 5)

  const blocksWithTeams = mergeBlocksWithTeams(blocks, teams).filter(
    (block) => block.proofs.length
  )

  return (
    <DataTableUncontrolled
      className={className}
      columns={columns}
      data={blocksWithTeams}
      hidePagination
    />
  )
}

export default SimpleBlocksTable

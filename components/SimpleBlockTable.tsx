import { columns } from "./BlocksTable/columns"
import DataTableUncontrolled from "./ui/data-table-uncontrolled"

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

  const blocksWithTeams = mergeBlocksWithTeams(blocks, teams)

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

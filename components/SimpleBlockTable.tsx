import { columns } from "./BlocksTable/columns"
import DataTableUncontrolled from "./ui/data-table-uncontrolled"

import { fetchBlocksPaginated, MachineType } from "@/lib/api/blocks"
import { getTeams } from "@/lib/api/teams"
import { mergeBlocksWithTeams } from "@/lib/blocks"

type Props = {
  className?: string
  machineType: MachineType
}

const SimpleBlocksTable = async ({ className, machineType }: Props) => {
  const teams = await getTeams()
  const blocks = await fetchBlocksPaginated(
    { pageIndex: 0, pageSize: 5 },
    machineType
  )

  const blocksWithTeams = mergeBlocksWithTeams(blocks.rows, teams)

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

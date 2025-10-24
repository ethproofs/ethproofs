import { columns } from "./blocks-table/columns"
import { DataTable } from "./data-table/data-table"

import { fetchBlocks, MachineType } from "@/lib/api/blocks"
import { getTeams } from "@/lib/api/teams"
import { mergeBlocksWithTeams } from "@/lib/blocks"

type Props = {
  machineType: MachineType
}

const SimpleBlocksTable = async ({ machineType }: Props) => {
  const teams = await getTeams()
  const blocks = await fetchBlocks(machineType, 5)

  const blocksWithTeams = mergeBlocksWithTeams(blocks, teams).filter(
    (block) => block.proofs.length
  )

  return (
    <DataTable
      className="px-6"
      columns={columns}
      data={blocksWithTeams}
      rowCount={blocksWithTeams.length}
      pagination={{ pageIndex: 0, pageSize: 5 }}
      showToolbar={false}
      showPagination={false}
    />
  )
}

export default SimpleBlocksTable

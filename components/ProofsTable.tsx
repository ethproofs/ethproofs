import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type { BlockWithProofs } from "@/lib/types"

type Props = {
  className?: string
  blocks: BlockWithProofs[]
}

const ProofsTable = ({ blocks, ...props }: Props) => {
  return (
    <Table {...props}>
      <TableCaption>Proofs</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Block Number</TableHead>
          <TableHead>Timestamp</TableHead>
          <TableHead>Gas Used</TableHead>
          <TableHead>Transaction Count</TableHead>
          <TableHead>Proofs</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {blocks?.map((block) => (
          <TableRow key={block.block_number}>
            <TableCell className="w-[100px]">{block.block_number}</TableCell>
            <TableCell>{block.timestamp}</TableCell>
            <TableCell>{block.gas_used}</TableCell>
            <TableCell>{block.transaction_count}</TableCell>
            <TableCell>
              <ul>
                {block.proofs.map((proof) => (
                  <li key={proof.proof_id}>{proof.proof_id}</li>
                ))}
              </ul>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default ProofsTable

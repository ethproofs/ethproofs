import { createClient } from '@/utils/supabase/server';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function Proofs() {
  const supabase = createClient();
  const { data: proofs } = await supabase.from("proofs").select();

  return (
    <Table className="max-w-screen-lg mx-auto my-8">
      <TableCaption>Proofs</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Proof ID</TableHead>
          <TableHead>Block Number</TableHead>
          <TableHead>Proof</TableHead>
          <TableHead>Proof Status</TableHead>
          <TableHead>Prover Machine ID</TableHead>
          <TableHead>Prover Duration</TableHead>
          <TableHead>Proving Cost</TableHead>
          <TableHead>Proving Cycles</TableHead>
          <TableHead>Submission Time</TableHead>
          <TableHead>Team ID</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {proofs?.map((proof) => (
          <TableRow key={proof.proof_id}>
            <TableCell className="w-[100px]">{proof.proof_id}</TableCell>
            <TableCell>{proof.block_number}</TableCell>
            <TableCell>{proof.proof}</TableCell>
            <TableCell>{proof.proof_status}</TableCell>
            <TableCell>{proof.prover_machine_id}</TableCell>
            <TableCell>{proof.prover_duration}</TableCell>
            <TableCell>{proof.proving_cost}</TableCell>
            <TableCell>{proof.proving_cycles}</TableCell>
            <TableCell>{proof.submission_time}</TableCell>
            <TableCell>{proof.team_id}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
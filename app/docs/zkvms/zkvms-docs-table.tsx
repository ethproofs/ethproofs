import { Fragment } from "react"

import type { Team, Zkvm, ZkvmVersion } from "@/lib/types"

import Link from "@/components/ui/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function ZkvmsDocsTable({
  zkvms,
}: {
  zkvms: (Zkvm & { versions: ZkvmVersion[]; team: Team })[]
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>zkVM</TableHead>
          <TableHead>id</TableHead>
          <TableHead>version</TableHead>
          <TableHead>ISA</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {zkvms.map((zkvm) => (
          <Fragment key={zkvm.id}>
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={4} className="whitespace-nowrap">
                {zkvm.repo_url ? (
                  <Link href={zkvm.repo_url}>{zkvm.name}</Link>
                ) : (
                  zkvm.name
                )}
              </TableCell>
            </TableRow>
            {zkvm.versions.map((version) => (
              <TableRow key={`${zkvm.id}-${version.version}`}>
                <TableCell />
                <TableCell className="border-l-2 border-r-2 border-primary bg-primary/5">
                  {version.id}
                </TableCell>
                <TableCell>{version.version}</TableCell>
                <TableCell>{zkvm.isa}</TableCell>
              </TableRow>
            ))}
          </Fragment>
        ))}
      </TableBody>
    </Table>
  )
}

import { Fragment } from "react"

import type { Vendor, Zkvm, ZkvmVersion } from "@/lib/types"

import Link from "@/components/ui/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function ZkvmsTable({
  zkvms,
}: {
  zkvms: (Zkvm & { versions: ZkvmVersion[]; vendor: Vendor })[]
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>zkVM</TableHead>
          <TableHead>ID</TableHead>
          <TableHead>Version</TableHead>
          <TableHead>ISA</TableHead>
          <TableHead>Continuations</TableHead>
          <TableHead>Parallelizable Proving</TableHead>
          <TableHead>Precompiles</TableHead>
          <TableHead>Frontend</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {zkvms.map((zkvms) => (
          <Fragment key={zkvms.id}>
            <TableRow>
              <TableCell className="whitespace-nowrap">
                <Link href={zkvms.repo_url}>{zkvms.name}</Link>
              </TableCell>
            </TableRow>
            {zkvms.versions.map((version) => (
              <TableRow key={`${zkvms.id}-${version.version}`}>
                <TableCell />
                <TableCell className="border-l-2 border-r-2 border-primary bg-primary/5">
                  {version.id}
                </TableCell>
                <TableCell>{version.version}</TableCell>
                <TableCell>{zkvms.isa}</TableCell>
                <TableCell>{zkvms.continuations ? "Yes" : "No"}</TableCell>
                <TableCell>
                  {zkvms.parallelizable_proving ? "Yes" : "No"}
                </TableCell>
                <TableCell>{zkvms.precompiles ? "Yes" : "No"}</TableCell>
                <TableCell>{zkvms.frontend}</TableCell>
              </TableRow>
            ))}
          </Fragment>
        ))}
      </TableBody>
    </Table>
  )
}

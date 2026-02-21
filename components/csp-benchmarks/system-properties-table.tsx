"use client"

import { useMemo } from "react"

import { Null } from "@/components/Null"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  buildSystemPropertiesFromRow,
  type SystemProperties,
} from "./system/properties"
import { getProverKey } from "./metrics"

import type { Metrics } from "@/lib/api/csp-benchmarks"

const auditStatusDisplay: Record<string, string> = {
  audited: "audited",
  not_audited: "not audited",
  partially_audited: "partial",
}

function formatBoolean(value: boolean | undefined): {
  text: string
  isMuted: boolean
} {
  if (typeof value !== "boolean") return { text: "--", isMuted: true }
  return value
    ? { text: "yes", isMuted: false }
    : { text: "no", isMuted: true }
}

function deduplicateProvers(metrics: Metrics[]): SystemProperties[] {
  const seen = new Map<string, SystemProperties>()
  for (const row of metrics) {
    const key = getProverKey(row)
    if (!seen.has(key)) {
      seen.set(key, buildSystemPropertiesFromRow(row))
    }
  }
  return Array.from(seen.values()).sort((a, b) =>
    a.proverKey.localeCompare(b.proverKey)
  )
}

const cellClass = "px-3 py-2 text-sm whitespace-nowrap"
const headClass = "px-3 py-2 whitespace-nowrap"

interface SystemPropertiesTableProps {
  benchmarks: Metrics[]
}

export function SystemPropertiesTable({
  benchmarks,
}: SystemPropertiesTableProps) {
  const provers = useMemo(() => deduplicateProvers(benchmarks), [benchmarks])

  if (provers.length === 0) return null

  return (
    <div className="rounded-lg border">
      <Table className="lowercase">
        <TableHeader>
          <TableRow>
            <TableHead className={headClass}>prover</TableHead>
            <TableHead className={headClass}>proof system</TableHead>
            <TableHead className={headClass}>arithmetization</TableHead>
            <TableHead className={headClass}>field / curve</TableHead>
            <TableHead className={headClass}>zkVM</TableHead>
            <TableHead className={headClass}>zero-knowledge</TableHead>
            <TableHead className={headClass}>post-quantum</TableHead>
            <TableHead className={headClass}>security</TableHead>
            <TableHead className={headClass}>audit</TableHead>
            <TableHead className={headClass}>maintained</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {provers.map((prover) => {
            const zk = formatBoolean(prover.is_zk)
            const pq = formatBoolean(prover.is_pq)
            const maintained = formatBoolean(prover.is_maintained)

            const hasSecurityBits =
              typeof prover.security_bits === "number" &&
              prover.security_bits > 0

            const auditText = prover.is_audited
              ? auditStatusDisplay[prover.is_audited] ?? prover.is_audited
              : undefined
            const isAuditMuted =
              !prover.is_audited || prover.is_audited !== "audited"

            return (
              <TableRow key={prover.proverKey}>
                <TableCell className={cellClass}>
                  <span className="font-medium">{prover.proverKey}</span>
                </TableCell>
                <TableCell className={cellClass}>
                  {prover.proving_system ?? <Null />}
                </TableCell>
                <TableCell className={cellClass}>
                  {prover.arithm ?? <Null />}
                </TableCell>
                <TableCell className={cellClass}>
                  {prover.field_curve ?? <Null />}
                </TableCell>
                <TableCell className={cellClass}>
                  {prover.is_zkvm ? "yes" : "no"}
                </TableCell>
                <TableCell className={cellClass}>
                  <span className={zk.isMuted ? "text-muted-foreground" : ""}>
                    {zk.text}
                  </span>
                </TableCell>
                <TableCell className={cellClass}>
                  <span className={pq.isMuted ? "text-muted-foreground" : ""}>
                    {pq.text}
                  </span>
                </TableCell>
                <TableCell className={cellClass}>
                  {hasSecurityBits ? (
                    `${prover.security_bits}-bit`
                  ) : (
                    <span className="text-muted-foreground">--</span>
                  )}
                </TableCell>
                <TableCell className={cellClass}>
                  {auditText ? (
                    <span className={isAuditMuted ? "text-muted-foreground" : ""}>
                      {auditText}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">--</span>
                  )}
                </TableCell>
                <TableCell className={cellClass}>
                  <span className={maintained.isMuted ? "text-muted-foreground" : ""}>
                    {maintained.text}
                  </span>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

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

import { severityColors } from "./system/legend"
import {
  buildSystemPropertiesFromRow,
  type SystemProperties,
} from "./system/properties"
import {
  getAuditSeverity,
  getBooleanSeverity,
  getSecurityBitsSeverity,
} from "./system/slices"
import { getProverKey } from "./metrics"
import { EmptyState } from "./shared"
import { TableFilters, useTableFilters } from "./table-filters"

import type { Metrics } from "@/lib/api/csp-benchmarks"

const auditStatusDisplay: Record<string, string> = {
  audited: "audited",
  not_audited: "not audited",
  partially_audited: "partial",
}

function formatBooleanText(value: boolean | undefined): string {
  if (typeof value !== "boolean") return "--"
  return value ? "yes" : "no"
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
  const { filters, setFilter, activeCount, applyFilters } = useTableFilters()
  const filtered = useMemo(() => applyFilters(benchmarks), [applyFilters, benchmarks])
  const provers = useMemo(() => deduplicateProvers(filtered), [filtered])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <TableFilters filters={filters} setFilter={setFilter} activeCount={activeCount} />
      </div>
      {provers.length === 0 ? (
        <EmptyState message="no provers match the selected filters" />
      ) : <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={headClass}>prover</TableHead>
            <TableHead className={headClass}>proving system</TableHead>
            <TableHead className={headClass}>zero-knowledge</TableHead>
            <TableHead className={headClass}>post-quantum</TableHead>
            <TableHead className={headClass}>security</TableHead>
            <TableHead className={headClass}>VM</TableHead>
            <TableHead className={headClass}>ISA</TableHead>
            <TableHead className={headClass}>audit</TableHead>
            <TableHead className={headClass}>maintained</TableHead>
            <TableHead className={headClass}>field / curve</TableHead>
            <TableHead className={headClass}>arithmetization</TableHead>
            <TableHead className={headClass}>IOP</TableHead>
            <TableHead className={headClass}>PCS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {provers.map((prover) => {
            const hasSecurityBits =
              typeof prover.security_bits === "number" &&
              prover.security_bits > 0

            const auditText = prover.is_audited
              ? auditStatusDisplay[prover.is_audited] ?? prover.is_audited
              : undefined

            return (
              <TableRow key={prover.proverKey}>
                <TableCell className={cellClass}>
                  <span className="font-medium">{prover.proverKey}</span>
                </TableCell>
                <TableCell className={cellClass}>
                  {prover.proving_system ?? <Null />}
                </TableCell>
                <TableCell className={cellClass}>
                  <span style={{ color: severityColors[getBooleanSeverity(prover.is_zk)] }}>
                    {formatBooleanText(prover.is_zk)}
                  </span>
                </TableCell>
                <TableCell className={cellClass}>
                  <span style={{ color: severityColors[getBooleanSeverity(prover.is_pq)] }}>
                    {formatBooleanText(prover.is_pq)}
                  </span>
                </TableCell>
                <TableCell className={cellClass}>
                  <span style={{ color: severityColors[getSecurityBitsSeverity(prover.security_bits)] }}>
                    {hasSecurityBits ? `${prover.security_bits}-bit` : "--"}
                  </span>
                </TableCell>
                <TableCell className={cellClass}>
                  {prover.is_zkvm ? "yes" : "no"}
                </TableCell>
                <TableCell className={cellClass}>
                  {prover.isa ?? <Null />}
                </TableCell>
                <TableCell className={cellClass}>
                  <span style={{ color: severityColors[getAuditSeverity(prover.is_audited)] }}>
                    {auditText ?? "--"}
                  </span>
                </TableCell>
                <TableCell className={cellClass}>
                  <span style={{ color: severityColors[getBooleanSeverity(prover.is_maintained)] }}>
                    {formatBooleanText(prover.is_maintained)}
                  </span>
                </TableCell>
                <TableCell className={cellClass}>
                  {prover.field_curve ?? <Null />}
                </TableCell>
                <TableCell className={cellClass}>
                  {prover.arithm ?? <Null />}
                </TableCell>
                <TableCell className={cellClass}>
                  {prover.iop ?? <Null />}
                </TableCell>
                <TableCell className={cellClass}>
                  {prover.pcs ?? <Null />}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      </div>}
    </div>
  )
}

"use client"

import { useActionState } from "react"
import { Check, Pencil, Trash2 } from "lucide-react"

import type { Team, Zkvm } from "@/lib/types"
import { isZkvmPendingUpdates } from "@/lib/types"

import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"

import { approveZkvm, rejectZkvm } from "@/app/admin/actions"

type PendingZkvm = Zkvm & { team: Pick<Team, "name"> | null }

interface PendingZkvmsListProps {
  zkvms: PendingZkvm[]
}

export function PendingZkvmsList({ zkvms }: PendingZkvmsListProps) {
  return (
    <div className="flex flex-col gap-4">
      {zkvms.map((zkvm) => (
        <PendingZkvmItem key={zkvm.id} zkvm={zkvm} />
      ))}
    </div>
  )
}

function PendingZkvmItem({ zkvm }: { zkvm: PendingZkvm }) {
  const [approveState, approveAction] = useActionState(approveZkvm, {
    errors: {},
  })
  const [rejectState, rejectAction] = useActionState(rejectZkvm, {
    errors: {},
  })

  const isEditRequest = zkvm.approved && zkvm.pending_updates !== null
  const pendingUpdates = isZkvmPendingUpdates(zkvm.pending_updates)
    ? zkvm.pending_updates
    : null

  if (approveState.data?.success) {
    return (
      <Card className="flex items-center justify-between">
        <CardHeader className="space-y-0 p-4">
          <CardTitle className="text-lg">{zkvm.name}</CardTitle>
          <CardDescription className="text-primary">approved</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <Check className="text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (rejectState.data?.success) {
    return (
      <Card className="flex items-center justify-between opacity-50">
        <CardHeader className="space-y-0 p-4">
          <CardTitle className="text-lg">{zkvm.name}</CardTitle>
          <CardDescription className="text-destructive">
            rejected
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <Trash2 className="text-destructive" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardHeader className="space-y-0 p-4">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{zkvm.name}</CardTitle>
            {isEditRequest ? (
              <Badge variant="outline" className="text-warning">
                update
              </Badge>
            ) : (
              <Badge variant="outline" className="text-warning">
                new
              </Badge>
            )}
          </div>
          <CardDescription>
            team: {zkvm.team?.name ?? "unknown"}
          </CardDescription>
          <CardDescription>
            requested:{" "}
            {new Date(
              (isEditRequest ? zkvm.updated_at : zkvm.created_at) ??
                zkvm.created_at
            ).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2 p-4">
          {approveState.errors?.zkvmId || rejectState.errors?.zkvmId ? (
            <p className="text-sm text-destructive">
              {approveState.errors?.zkvmId?.[0] ||
                rejectState.errors?.zkvmId?.[0]}
            </p>
          ) : (
            <>
              <form action={approveAction}>
                <input type="hidden" name="zkvmId" value={zkvm.id} />
                <Button type="submit" size="sm" variant="default">
                  approve
                </Button>
              </form>
              <form action={rejectAction}>
                <input type="hidden" name="zkvmId" value={zkvm.id} />
                <Button type="submit" size="sm" variant="destructive">
                  reject
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </div>
      {isEditRequest && pendingUpdates && (
        <CardContent className="border-t px-4 py-3">
          <p className="mb-2 text-xs text-muted-foreground">
            proposed changes:
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {pendingUpdates.name && pendingUpdates.name !== zkvm.name && (
              <Badge variant="secondary">name: {pendingUpdates.name}</Badge>
            )}
            {pendingUpdates.isa && pendingUpdates.isa !== zkvm.isa && (
              <Badge variant="secondary">isa: {pendingUpdates.isa}</Badge>
            )}
            {pendingUpdates.is_open_source !== undefined &&
              pendingUpdates.is_open_source !== zkvm.is_open_source && (
                <Badge variant="secondary">
                  open source: {pendingUpdates.is_open_source ? "yes" : "no"}
                </Badge>
              )}
            {pendingUpdates.is_dual_licensed !== undefined &&
              pendingUpdates.is_dual_licensed !== zkvm.is_dual_licensed && (
                <Badge variant="secondary">
                  dual licensed:{" "}
                  {pendingUpdates.is_dual_licensed ? "yes" : "no"}
                </Badge>
              )}
            {pendingUpdates.is_proving_mainnet !== undefined &&
              pendingUpdates.is_proving_mainnet !== zkvm.is_proving_mainnet && (
                <Badge variant="secondary">
                  proving mainnet:{" "}
                  {pendingUpdates.is_proving_mainnet ? "yes" : "no"}
                </Badge>
              )}
            {pendingUpdates.version && (
              <Badge variant="secondary">
                version: {pendingUpdates.version}
              </Badge>
            )}
            {pendingUpdates.security_metrics && (
              <>
                {pendingUpdates.security_metrics.implementation_soundness !==
                  undefined && (
                  <Badge variant="secondary">
                    soundness:{" "}
                    {pendingUpdates.security_metrics.implementation_soundness}
                  </Badge>
                )}
                {pendingUpdates.security_metrics.evm_stf_bytecode !==
                  undefined && (
                  <Badge variant="secondary">
                    evm stf bytecode:{" "}
                    {pendingUpdates.security_metrics.evm_stf_bytecode}
                  </Badge>
                )}
                {pendingUpdates.security_metrics.quantum_security !==
                  undefined && (
                  <Badge variant="secondary">
                    quantum security:{" "}
                    {pendingUpdates.security_metrics.quantum_security}
                  </Badge>
                )}
                {pendingUpdates.security_metrics.security_target_bits !==
                  undefined && (
                  <Badge variant="secondary">
                    security bits:{" "}
                    {pendingUpdates.security_metrics.security_target_bits}
                  </Badge>
                )}
                {pendingUpdates.security_metrics.max_bounty_amount !==
                  undefined && (
                  <Badge variant="secondary">
                    max bounty: $
                    {pendingUpdates.security_metrics.max_bounty_amount.toLocaleString()}
                  </Badge>
                )}
              </>
            )}
            {pendingUpdates.performance_metrics && (
              <>
                {pendingUpdates.performance_metrics.size_bytes !==
                  undefined && (
                  <Badge variant="secondary">
                    proof size:{" "}
                    {pendingUpdates.performance_metrics.size_bytes.toLocaleString()}{" "}
                    bytes
                  </Badge>
                )}
                {pendingUpdates.performance_metrics.verification_ms !==
                  undefined && (
                  <Badge variant="secondary">
                    verification:{" "}
                    {pendingUpdates.performance_metrics.verification_ms}ms
                  </Badge>
                )}
              </>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

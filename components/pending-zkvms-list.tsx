"use client"

import { useActionState } from "react"
import { Check, Trash2 } from "lucide-react"

import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"

import { approveZkvm, rejectZkvm } from "@/app/admin/actions"

type Zkvm = {
  id: number
  name: string
  slug: string
  isa: string
  team_id: string
  created_at: string
  team: {
    name: string
  } | null
}

interface PendingZkvmsListProps {
  zkvms: Zkvm[]
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

function PendingZkvmItem({ zkvm }: { zkvm: Zkvm }) {
  const [approveState, approveAction] = useActionState(approveZkvm, {
    errors: {},
  })
  const [rejectState, rejectAction] = useActionState(rejectZkvm, {
    errors: {},
  })

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
    <Card className="flex items-center justify-between">
      <CardHeader className="space-y-0 p-4">
        <CardTitle className="text-lg">{zkvm.name}</CardTitle>
        <CardDescription>
          team: {zkvm.team?.name ?? "unknown"} · isa: {zkvm.isa} · requested:{" "}
          {new Date(zkvm.created_at).toLocaleDateString()}
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
    </Card>
  )
}

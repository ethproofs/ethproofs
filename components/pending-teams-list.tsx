"use client"

import { useActionState } from "react"
import { Check } from "lucide-react"

import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import CopyButton from "./CopyButton"

import { approveTeam, rejectTeam } from "@/app/admin/actions"

type Team = {
  id: string
  name: string
  slug: string
  github_org: string | null
  logo_url: string | null
  twitter_handle: string | null
  website_url: string | null
  storage_quota_bytes: number | null
  approved: boolean
  created_at: string
}

export function PendingTeamsList({ teams }: { teams: Team[] }) {
  return (
    <div className="flex flex-col gap-4">
      {teams.map((team) => (
        <PendingTeamItem key={team.id} team={team} />
      ))}
    </div>
  )
}

function PendingTeamItem({ team }: { team: Team }) {
  const [approveState, approveAction] = useActionState(approveTeam, {
    errors: {},
  })
  const [rejectState, rejectAction] = useActionState(rejectTeam, {
    errors: {},
  })

  // Show success message with API key after approval
  if (approveState.data?.success && approveState.data?.apikey) {
    return (
      <Card className="flex items-center justify-between">
        <CardHeader className="space-y-0 p-4">
          <CardTitle className="text-lg">{team.name}</CardTitle>
          <CardDescription className="flex items-center">
            <span className="text-primary-dark">
              {approveState.data.apikey}
            </span>
            <CopyButton message={approveState.data.apikey} />
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <Check />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex items-center justify-between">
      <CardHeader className="space-y-0 p-4">
        <CardTitle className="text-lg">{team.name}</CardTitle>
        <CardDescription>
          requested: {new Date(team.created_at).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-2 p-4">
        {approveState.errors?.teamId || rejectState.errors?.teamId ? (
          <p className="text-sm text-destructive">
            {approveState.errors?.teamId?.[0] ||
              rejectState.errors?.teamId?.[0]}
          </p>
        ) : (
          <>
            <form action={approveAction}>
              <input type="hidden" name="teamId" value={team.id} />
              <Button type="submit" size="sm" variant="default">
                approve
              </Button>
            </form>
            <form action={rejectAction}>
              <input type="hidden" name="teamId" value={team.id} />
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

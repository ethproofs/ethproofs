import { notFound, redirect } from "next/navigation"

import { API_KEY_MANAGER_ROLE } from "@/lib/constants"

import { DashboardContent } from "./dashboard-content"

import {
  getClusters,
  getProverTypes,
  getZkvmVersions,
} from "@/lib/api/clusters"
import { getGuestPrograms } from "@/lib/api/guest-programs"
import { getZkvmsWithMetrics } from "@/lib/api/metrics"
import { getTeamBySlug } from "@/lib/api/teams"
import { getZkvmsByTeamId } from "@/lib/api/zkvms"
import { createClient } from "@/utils/supabase/server"

interface DashboardPageProps {
  params: Promise<{
    teamSlug: string
  }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { teamSlug } = await params

  // Authenticate user
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  // Get team by slug
  const team = await getTeamBySlug(teamSlug)

  if (!team) {
    notFound()
  }

  const isAdmin = user.role === API_KEY_MANAGER_ROLE

  // Verify ownership and approval (admins can view any team's dashboard)
  if (!isAdmin && team.id !== user.id) {
    notFound()
  }

  if (!isAdmin && !team.approved) {
    notFound()
  }

  const [clusters, teamZkvms, zkvmVersions, proverTypes, guestPrograms] =
    await Promise.all([
      getClusters({ teamId: team.id }),
      getZkvmsByTeamId(team.id, { includeUnapproved: true }),
      getZkvmVersions(),
      getProverTypes(),
      getGuestPrograms(),
    ])

  const zkvmIds = teamZkvms.map((z) => z.id)
  const zkvmsWithMetrics =
    zkvmIds.length > 0 ? await getZkvmsWithMetrics({ zkvmIds }) : []

  const zkvms = teamZkvms.map((zkvm) => {
    const metrics = zkvmsWithMetrics.find((m) => m.id === zkvm.id)
    return {
      ...zkvm,
      security_metrics: metrics?.security_metrics ?? null,
      performance_metrics: metrics?.performance_metrics ?? null,
    }
  })

  return (
    <div className="mx-auto mt-2 flex max-w-screen-xl flex-1 flex-col items-center gap-20 [&>section]:w-full">
      <section>
        <DashboardContent
          team={team}
          clusters={clusters}
          zkvms={zkvms}
          zkvmVersions={zkvmVersions}
          proverTypes={proverTypes}
          guestPrograms={guestPrograms}
        />
      </section>
    </div>
  )
}

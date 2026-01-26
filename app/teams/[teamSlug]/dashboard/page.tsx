import { notFound, redirect } from "next/navigation"

import { API_KEY_MANAGER_ROLE } from "@/lib/constants"

import { DashboardContent } from "./dashboard-content"

import {
  getClusters,
  getProverTypes,
  getZkvmVersions,
} from "@/lib/api/clusters"
import { getGuestPrograms } from "@/lib/api/guest-programs"
import { getTeamBySlug } from "@/lib/api/teams"
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

  const [clusters, zkvmVersions, proverTypes, guestPrograms] =
    await Promise.all([
      getClusters({ teamId: team.id }),
      getZkvmVersions(),
      getProverTypes(),
      getGuestPrograms(),
    ])

  return (
    <div className="mx-auto mt-2 flex max-w-screen-xl flex-1 flex-col items-center gap-20 [&>section]:w-full">
      <section>
        <DashboardContent
          team={team}
          clusters={clusters}
          zkvmVersions={zkvmVersions}
          proverTypes={proverTypes}
          guestPrograms={guestPrograms}
        />
      </section>
    </div>
  )
}

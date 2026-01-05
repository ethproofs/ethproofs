import { notFound, redirect } from "next/navigation"

import { API_KEY_MANAGER_ROLE } from "@/lib/constants"

import { DashboardContent } from "./dashboard-content"

import { getClusters, getZkvmVersions } from "@/lib/api/clusters"
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

  // Fetch team's clusters with versions
  const clusters = await getClusters({ teamId: team.id })

  // Fetch all zkvm versions for dropdown
  const zkvmVersions = await getZkvmVersions()

  return (
    <div className="mx-auto mt-2 flex max-w-screen-xl flex-1 flex-col items-center gap-20 [&>section]:w-full">
      <section>
        <DashboardContent
          team={team}
          clusters={clusters}
          zkvmVersions={zkvmVersions}
        />
      </section>
    </div>
  )
}

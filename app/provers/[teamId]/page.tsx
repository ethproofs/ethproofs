import { redirect } from "next/navigation"

import type { TeamDetailsPageProps } from "@/app/teams/[teamId]/page"

export default async function RedirectPage({ params }: TeamDetailsPageProps) {
  const { teamId } = await params

  redirect("/teams/" + teamId)
}

import { redirect } from "next/navigation"

import type { TeamDetailsPageProps } from "@/app/teams/[teamSlug]/page"

export default async function RedirectPage({ params }: TeamDetailsPageProps) {
  const { teamSlug } = await params

  redirect("/teams/" + teamSlug)
}

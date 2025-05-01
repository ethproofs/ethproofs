import { redirect } from "next/navigation"

import type { ProverPageProps } from "@/app/prover/[teamId]/page"

export default async function ProverPage({ params }: ProverPageProps) {
  const { teamId } = await params

  redirect("/prover/" + teamId)
}

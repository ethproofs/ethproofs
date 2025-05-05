import { redirect } from "next/navigation"

import type { ClusterDetailsPageProps } from "@/app/clusters/[clusterId]/page"

export default async function RedirectPage({
  params,
}: ClusterDetailsPageProps) {
  const { clusterId } = await params

  redirect("/clusters/" + clusterId)
}

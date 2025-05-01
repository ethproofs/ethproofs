import { redirect } from "next/navigation"

import type { ClusterDetailsPageProps } from "@/app/cluster/[clusterId]/page"

export default async function RedirectPage({
  params,
}: ClusterDetailsPageProps) {
  const { clusterId } = await params

  redirect("/cluster/" + clusterId)
}

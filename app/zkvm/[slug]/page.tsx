import { redirect } from "next/navigation"

import type { ZkvmDetailsPageProps } from "@/app/zkvms/[slug]/page"

export default async function RedirectPage({ params }: ZkvmDetailsPageProps) {
  const { slug } = await params

  redirect("/zkvms/" + slug)
}

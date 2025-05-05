import { redirect } from "next/navigation"

import type { BlockDetailsPageProps } from "@/app/blocks/[block]/page"

export default async function RedirectPage({ params }: BlockDetailsPageProps) {
  const { block } = await params

  redirect("/blocks/" + block)
}

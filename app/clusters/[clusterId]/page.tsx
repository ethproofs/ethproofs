import { redirect } from "next/navigation"

interface RedirectPageProps {
  params: Promise<{ clusterId: string }>
}

export default async function RedirectPage({ params }: RedirectPageProps) {
  const { clusterId } = await params
  redirect(`/provers?cluster=${encodeURIComponent(clusterId)}`)
}

import Link from "next/link"

import { Button } from "@/components/ui/button"

interface DashboardButtonProps {
  teamSlug: string
}

export function DashboardButton({ teamSlug }: DashboardButtonProps) {
  return (
    <Button asChild variant="outline">
      <Link href={`/teams/${teamSlug}/dashboard`}>dashboard</Link>
    </Button>
  )
}

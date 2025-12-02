"use client"

import { useTransition } from "react"

import { Button } from "@/components/ui/button"

import { signOut } from "@/app/admin/actions"

export function SignOutButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isPending}
      onClick={() => startTransition(() => signOut())}
    >
      {isPending ? "signing out..." : "sign out"}
    </Button>
  )
}

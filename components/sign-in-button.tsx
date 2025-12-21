"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"

export function SignInButton() {
  return (
    <Button type="button" variant="outline" asChild>
      <Link href="/sign-in">sign in</Link>
    </Button>
  )
}

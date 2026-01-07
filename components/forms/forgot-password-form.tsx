"use client"

import { useActionState } from "react"
import Link from "next/link"

import { Input } from "../ui/input"

import { Errors } from "./errors"
import { SubmitButton } from "./submit-button"

import { forgotPassword } from "@/app/admin/actions"

const initialState = {
  errors: {},
}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPassword, initialState)

  if (state.success) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm text-muted-foreground">
          check your email for a password reset link
        </p>
        <Link href="/sign-in" className="text-sm text-primary hover:underline">
          back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form className="flex flex-col gap-2" action={formAction}>
      <Input
        id="email"
        name="email"
        type="email"
        placeholder="email"
        required
      />
      <Errors errors={state.errors ?? {}} />
      <SubmitButton>send reset link</SubmitButton>
      <Link
        href="/sign-in"
        className="text-center text-sm text-muted-foreground hover:text-primary"
      >
        back to sign in
      </Link>
    </form>
  )
}

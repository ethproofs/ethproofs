"use client"

import { useActionState } from "react"

import { Input } from "../ui/input"

import { Errors } from "./errors"
import { SubmitButton } from "./submit-button"

import { signUp } from "@/app/sign-up/actions"

const initialState = {
  data: undefined,
  errors: {},
}

export function SignUpForm() {
  const [state, formAction] = useActionState(signUp, initialState)

  if (state.data) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-primary">thank you for registering</p>
        <p className="text-sm text-muted-foreground">
          your account is pending approval
        </p>
      </div>
    )
  }

  return (
    <form className="flex flex-col gap-4" action={formAction}>
      <Input
        id="email"
        name="email"
        type="email"
        placeholder="email"
        required
      />
      <Input
        id="password"
        name="password"
        type="password"
        placeholder="password"
        autoComplete="new-password"
        required
      />
      <Input
        id="name"
        name="name"
        type="text"
        placeholder="team name"
        required
      />

      <Errors errors={state.errors ?? {}} />
      <SubmitButton>create account</SubmitButton>
    </form>
  )
}

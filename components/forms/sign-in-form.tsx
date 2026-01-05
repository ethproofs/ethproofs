"use client"

import { useActionState } from "react"

import { Input } from "../ui/input"

import { Errors } from "./errors"
import { SubmitButton } from "./submit-button"

import { login } from "@/app/admin/actions"

const initialState = {
  errors: {},
}

export function SignInForm() {
  const [state, formAction] = useActionState(login, initialState)

  return (
    <form className="flex flex-col gap-2" action={formAction}>
      <Input
        id="email"
        name="email"
        type="email"
        placeholder="Email"
        required
      />
      <Input
        id="password"
        name="password"
        type="password"
        placeholder="Password"
        autoComplete="current-password"
        required
      />
      <Errors errors={state.errors} />
      <SubmitButton>submit</SubmitButton>
    </form>
  )
}

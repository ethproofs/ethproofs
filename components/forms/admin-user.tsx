"use client"

import { useFormState } from "react-dom"

import { Input } from "../ui/input"

import { Errors } from "./errors"
import { SubmitButton } from "./submit-button"

import { createUser } from "@/app/admin/actions"

const initialState = {
  data: undefined,
  errors: {},
}

export function AdminUserForm() {
  const [state, formAction] = useFormState(createUser, initialState)

  return (
    <form className="flex flex-col gap-4" action={formAction}>
      <Input id="name" name="name" type="text" placeholder="Name" required />

      <Input
        id="email"
        name="email"
        type="email"
        placeholder="Email"
        required
      />

      <Errors errors={state.errors ?? {}} />

      <SubmitButton>Create</SubmitButton>

      {state.data && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-bold">User</h3>
          <pre>
            {JSON.stringify(
              {
                id: state.data.user.id,
                email: state.data.user.email,
              },
              null,
              2
            )}
          </pre>
        </div>
      )}
    </form>
  )
}

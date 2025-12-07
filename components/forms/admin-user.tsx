"use client"

import { useFormState } from "react-dom"

import { Input } from "../ui/input"
import { Label } from "../ui/label"

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
      <Input id="name" name="name" type="text" placeholder="team" required />
      <Input
        id="email"
        name="email"
        type="email"
        placeholder="email"
        required
      />
      <Input
        id="github_org"
        name="github_org"
        type="text"
        placeholder="github org"
      />
      <Input
        id="twitter_handle"
        name="twitter_handle"
        type="text"
        placeholder="twitter handle"
      />
      <Input id="website" name="website" type="text" placeholder="website" />
      <div className="position-relative display-inline-block flex flex-col gap-2">
        <span className="text-sm font-normal">logo (.svg)</span>
        <Label
          htmlFor="logo"
          className="h-10 w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm font-normal text-muted-foreground ring-offset-background hover:bg-accent"
        >
          choose file
        </Label>
        <Input
          accept="image/svg+xml"
          className="absolute left-[-9999px]"
          id="logo"
          name="logo"
          type="file"
        />
      </div>

      <Errors errors={state.errors ?? {}} />
      <SubmitButton>create</SubmitButton>

      {state.data && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-bold">user</h3>
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

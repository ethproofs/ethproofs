"use client"

import Link from "next/link"
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

      <Input
        id="github_org"
        name="github_org"
        type="text"
        placeholder="GitHub Organization"
      />

      <Input
        id="twitter_handle"
        name="twitter_handle"
        type="text"
        placeholder="Twitter Handle"
      />

      <Input id="website" name="website" type="text" placeholder="Website" />

      <div className="mt-4 flex flex-col gap-2">
        <label htmlFor="logo" className="text-sm font-bold">
          Logo
        </label>
        <p className="text-secondary text-sm">
          SVG file. Fill color black.{" "}
          <Link
            href="https://ndjfbkojyebmdbckigbe.supabase.co/storage/v1/object/public/public-assets/succinct-logo.svg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-light"
          >
            Example
          </Link>
        </p>
        <Input
          id="logo"
          name="logo"
          type="file"
          placeholder="Logo"
          accept="image/svg+xml"
        />
      </div>

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

"use client"

import { useFormState } from "react-dom"

import CopyButton from "../CopyButton"
import { Input } from "../ui/input"

import { Errors } from "./errors"
import { SubmitButton } from "./submit-button"

import { generateApiKey } from "@/app/admin/actions"

const initialState = {
  data: undefined,
  errors: {},
}

export function AdminApiKeyForm() {
  const [state, formAction] = useFormState(generateApiKey, initialState)

  return (
    <form className="flex flex-col gap-4" action={formAction}>
      <Input
        id="email"
        name="email"
        type="email"
        placeholder="User's email"
        required
      />

      <Errors errors={state.errors ?? {}} />

      <SubmitButton>Generate</SubmitButton>

      {state.data && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-bold">API Key</h3>
          <div className="flex gap-2">
            <div>{state.data.apikey}</div>
            <CopyButton message={state.data.apikey} />
          </div>
        </div>
      )}
    </form>
  )
}

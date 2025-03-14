"use client"

import { useFormState } from "react-dom"

import { Team } from "@/lib/types"

import CopyButton from "../CopyButton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

import { Errors } from "./errors"
import { SubmitButton } from "./submit-button"

import { generateApiKey } from "@/app/admin/actions"

const initialState = {
  data: undefined,
  errors: {},
}

export function AdminApiKeyForm({ teams }: { teams: Team[] }) {
  const [state, formAction] = useFormState(generateApiKey, initialState)

  return (
    <form className="flex flex-col gap-4" action={formAction}>
      <Select name="team" required>
        <SelectTrigger>
          <SelectValue placeholder="Select team" />
        </SelectTrigger>
        <SelectContent>
          {teams.map((team) => (
            <SelectItem key={team.id} value={team.id}>
              {team.name}{" "}
              <small className="text-muted-foreground">
                ({team.id.slice(0, 8)}...{team.id.slice(-12)})
              </small>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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

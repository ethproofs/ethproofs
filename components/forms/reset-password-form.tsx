"use client"

import { useActionState, useEffect, useState } from "react"

import { Input } from "../ui/input"

import { Errors } from "./errors"
import { SubmitButton } from "./submit-button"

import { resetPassword } from "@/app/admin/actions"
import { createClient } from "@/utils/supabase/client"

const initialState = {
  errors: {},
}

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPassword, initialState)
  const [isReady, setIsReady] = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user has a valid session from the email link
    const checkSession = async () => {
      const supabase = createClient()
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error || !session) {
        setSessionError("invalid or expired reset link")
      } else {
        setIsReady(true)
      }
    }

    checkSession()
  }, [])

  if (sessionError) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm text-muted-foreground">{sessionError}</p>
        <a
          href="/forgot-password"
          className="text-sm text-primary hover:underline"
        >
          request new reset link
        </a>
      </div>
    )
  }

  if (!isReady) {
    return (
      <div className="text-center text-sm text-muted-foreground">
        <p>loading...</p>
      </div>
    )
  }

  return (
    <form className="flex flex-col gap-2" action={formAction}>
      <Input
        id="password"
        name="password"
        type="password"
        placeholder="new password"
        autoComplete="new-password"
        required
        minLength={6}
      />
      <Input
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        placeholder="confirm new password"
        autoComplete="new-password"
        required
        minLength={6}
      />
      <Errors errors={state.errors ?? {}} />
      <SubmitButton>update password</SubmitButton>
    </form>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import type { Team } from "@/lib/types"

import { Errors } from "@/components/forms/errors"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { updateTeamProfile } from "@/app/teams/[teamSlug]/dashboard/actions"

interface TeamProfileDrawerProps {
  team: Team
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FormState {
  loading: boolean
  errors: Record<string, string[]>
  success: boolean
}

const initialState: FormState = {
  loading: false,
  errors: {},
  success: false,
}

export function TeamProfileDrawer({
  team,
  open,
  onOpenChange,
}: TeamProfileDrawerProps) {
  const router = useRouter()
  const [state, setState] = useState<FormState>(initialState)

  useEffect(() => {
    setState(initialState)
  }, [open])

  useEffect(() => {
    if (state.success) {
      router.refresh()
      onOpenChange(false)
    }
  }, [state.success, onOpenChange, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setState({ loading: true, errors: {}, success: false })

    try {
      const formData = new FormData(e.currentTarget)
      const result = await updateTeamProfile(null, formData)

      if ("errors" in result && result.errors) {
        setState({
          loading: false,
          errors: result.errors,
          success: false,
        })
        return
      }

      setState({
        loading: false,
        errors: {},
        success: true,
      })
    } catch (error) {
      setState({
        loading: false,
        errors: {
          _form: [
            error instanceof Error
              ? error.message
              : "an unexpected error occurred",
          ],
        },
        success: false,
      })
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-full w-[500px] overflow-y-auto border-l">
        <DrawerHeader>
          <DrawerTitle>edit team profile</DrawerTitle>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-4">
          <div className="flex-1 space-y-4">
            <input type="hidden" name="team_id" value={team.id} />
            <input type="hidden" name="team_slug" value={team.slug} />

            <div className="space-y-2">
              <Label htmlFor="name">team name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                defaultValue={team.name}
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website_url">website url</Label>
              <Input
                id="website_url"
                name="website_url"
                type="url"
                placeholder="https://example.com"
                defaultValue={team.website_url || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter_handle">twitter handle</Label>
              <Input
                id="twitter_handle"
                name="twitter_handle"
                type="text"
                placeholder="handle (without @)"
                defaultValue={team.twitter_handle || ""}
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="github_org">github organization</Label>
              <Input
                id="github_org"
                name="github_org"
                type="text"
                placeholder="organization name"
                defaultValue={team.github_org || ""}
                maxLength={100}
              />
            </div>

            <Errors errors={state.errors ?? {}} />
          </div>

          <DrawerFooter className="px-0">
            <Button type="submit" disabled={state.loading}>
              {state.loading ? "saving..." : "save changes"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" disabled={state.loading}>
                cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}

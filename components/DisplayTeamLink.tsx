import Image from "next/image"

import type { Team } from "@/lib/types"

import { cn } from "@/lib/utils"

import Link from "./ui/link"

type DisplayTeamProps = {
  team: Pick<Team, "slug" | "logo_url" | "name">
  height?: number
  hideDot?: boolean
  className?: string
}

const DisplayTeam = ({
  team: { logo_url, name },
  height = 16,
  hideDot,
  className,
}: DisplayTeamProps) => (
  <div className={className}>
    {logo_url ? (
      <>
        <Image
          src={logo_url}
          alt={`${name} team logo`}
          height={height}
          width={height}
          style={{ height: `${height}px`, width: "auto" }}
          className="dark:invert"
        />
        <span className="sr-only">{name}</span>
      </>
    ) : (
      <div className="flex items-center gap-2">
        {!hideDot && <div className="size-4 rounded-full bg-primary-border" />}
        {name}
      </div>
    )}
  </div>
)

type DisplayTeamLinkProps = {
  team: Pick<Team, "slug" | "logo_url" | "name">
  height?: number
  className?: string
  hideDot?: boolean
}

const DisplayTeamLink = ({
  team: { slug, logo_url, name },
  height = 16,
  className,
  hideDot,
}: DisplayTeamLinkProps) => (
  <Link
    href={`/teams/${slug}`}
    className={cn(
      "-m-1 h-fit w-fit rounded p-1 hover:bg-primary/10",
      className
    )}
  >
    {logo_url ? (
      <>
        <Image
          src={logo_url}
          alt={`${name} team logo`}
          height={height}
          width={height}
          style={{ height: `${height}px`, width: "auto" }}
          className="dark:invert"
        />
        <span className="sr-only">{name}</span>
      </>
    ) : (
      <div className="flex items-center gap-2">
        {!hideDot && <div className="size-4 rounded-full bg-primary-border" />}
        {name}
      </div>
    )}
  </Link>
)

DisplayTeamLink.displayName = "DisplayTeamLink"

export { DisplayTeam, DisplayTeamLink }

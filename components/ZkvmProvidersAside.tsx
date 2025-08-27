import Image from "next/image"

import type { Team, Zkvm } from "@/lib/types"

import Link from "@/components/ui/link"

import { cn } from "@/lib/utils"

const ZkvmProvidersAside = ({ team, zkvms }: { team: Team; zkvms: Zkvm[] }) => {
  return (
    <div className="flex flex-col gap-4">
      {zkvms.map((zkvm) =>
        team.name === "MatterLabs" ? (
          <ZkvmProviderAsideMatterLabs key={zkvm.id} team={team} zkvm={zkvm} />
        ) : (
          <ZkvmProviderAside key={zkvm.id} team={team} zkvm={zkvm} />
        )
      )}
    </div>
  )
}

const ZkvmProviderAside = ({ team, zkvm }: { team: Team; zkvm: Zkvm }) => {
  return (
    <aside className="flex flex-col gap-4 rounded bg-primary-dark px-6 py-4 text-center text-white">
      <div className="flex items-center justify-center gap-2">
        {team.logo_url && (
          <Image
            src={team.logo_url}
            alt={`${team.name} logo`}
            height={48}
            width={48}
            style={{ height: "1.5rem", width: "auto" }}
            className="inline-block invert"
          />
        )}
        <span className={cn(team.logo_url && "sr-only")}>{team.name}</span>
        is also the team behind the zkVM{" "}
        <Link
          href={`/zkvms/${zkvm.slug}`}
          className="text-primary-light hover:underline"
        >
          {zkvm.name}
        </Link>
      </div>
    </aside>
  )
}

// TODO:TEAM - handle special case requests for any team
const ZkvmProviderAsideMatterLabs = ({
  team,
  zkvm,
}: {
  team: Team
  zkvm: Zkvm
}) => {
  return (
    <aside className="flex flex-col gap-4 rounded bg-primary-dark px-6 py-4 text-center text-white">
      <div className="flex items-center justify-center gap-2">
        {team.logo_url && (
          <Image
            src={team.logo_url}
            alt={`${team.name} logo`}
            height={48}
            width={48}
            style={{ height: "1.5rem", width: "auto" }}
            className="inline-block invert"
          />
        )}
        <span className={cn(team.logo_url && "sr-only")}>{team.name}</span>
        are the inventors of{" "}
        <Link
          hideArrow
          href={"https://www.zksync.io/"}
          className="text-primary-light hover:underline"
        >
          ZKsync
        </Link>
        and the{" "}
        <Link
          href={`/zkvms/${zkvm.slug}`}
          className="text-primary-light hover:underline"
        >
          {zkvm.name}
        </Link>
        zkVM
      </div>
    </aside>
  )
}

export default ZkvmProvidersAside

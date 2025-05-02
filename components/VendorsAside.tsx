import Image from "next/image"

import { Team, Zkvm } from "@/lib/types"

import Link from "@/components/ui/link"

import { cn } from "@/lib/utils"

const VendorsAside = ({ team, zkvms }: { team: Team; zkvms: Zkvm[] }) => {
  return (
    <div className="flex flex-col gap-4">
      {zkvms.map((zkvm) => (
        <VendorAside key={zkvm.id} team={team} zkvm={zkvm} />
      ))}
    </div>
  )
}

const VendorAside = ({ team, zkvm }: { team: Team; zkvm: Zkvm }) => {
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
          href={`/zkvm/${zkvm.slug}`}
          className="text-primary-light hover:underline"
        >
          {zkvm.name}
        </Link>
      </div>
    </aside>
  )
}

export default VendorsAside

import Link from "next/link"

import type { Proof } from "@/lib/types"

const TeamName = ({ proof: { team, team_id } }: { proof: Proof }) => {
  if (!team) return `Team ${team_id.split("-")[0]}`
  return (
    <Link
      href={"/prover/" + team.id}
      className="text-xl text-primary underline"
    >
      {team.name}
    </Link>
  )
}

export default TeamName

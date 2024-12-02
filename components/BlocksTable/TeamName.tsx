import Link from "next/link"

import type { Proof } from "@/lib/types"

const TeamName = ({ proof: { team, user_id } }: { proof: Proof }) => {
  if (!team) return `Team ${user_id.split("-")[0]}`
  return (
    <Link
      href={"/prover/" + team.team_id}
      className="text-xl text-primary underline"
    >
      {team.team_name}
    </Link>
  )
}

export default TeamName

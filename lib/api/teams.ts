import { db } from "@/db"

export const getTeam = async (team_id: string) => {
  const team = await db.query.teams.findFirst({
    columns: {
      name: true,
    },
    where: (teams, { eq }) => eq(teams.id, team_id),
  })

  return team
}

import { db } from "@/db"

export const getTeam = async (id: string) => {
  const team = await db.query.teams.findFirst({
    columns: {
      name: true,
    },
    where: (teams, { eq }) => eq(teams.id, id),
  })

  return team
}

import z from ".."

export const teamSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  created_at: z.string(),
  updated_at: z.string().optional(),
})

export type Team = z.infer<typeof teamSchema>

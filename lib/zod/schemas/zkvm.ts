import z from ".."

export const zkvmSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  slug: z.string(),
  isa: z.string(),
  team_id: z.string().uuid(),
  created_at: z.string(),
})

export const zkvmVersionSchema = z.object({
  id: z.number().int(),
  version: z.string(),
  zkvm_id: z.number().int(),
  created_at: z.string(),
  zkvm: zkvmSchema.optional(),
})

export type Zkvm = z.infer<typeof zkvmSchema>
export type ZkvmVersion = z.infer<typeof zkvmVersionSchema>

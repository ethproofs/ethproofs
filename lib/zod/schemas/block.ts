import z from ".."

export const blockSchema = z.object({
  block_number: z.number().int(),
  hash: z.string(),
  timestamp: z.string(),
  gas_used: z.number().int(),
  transaction_count: z.number().int(),
  created_at: z.string(),
  updated_at: z.string().optional(),
})

export type Block = z.infer<typeof blockSchema>

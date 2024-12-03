import z from ".."

export const AwsInstancePricingSchema = z.object({
  id: z.number(),
  instance_type: z.string(),
  region: z.string(),
  hourly_price: z.number(),
  instance_memory: z.number(),
  vcpu: z.number(),
  instance_storage: z.string(),
  created_at: z.string(),
})

export type AwsInstancePricing = z.infer<typeof AwsInstancePricingSchema>
import { z } from 'zod'

export const tokenPayloadSchema = z.object({
  id: z.number(),
  exp: z.number(),
})

export type TokenPayload = z.infer<typeof tokenPayloadSchema>

import { z } from 'zod'

export const authUserPayloadSchema = z.object({
  id: z.number(),
  email: z.string().email({ message: 'Invalid email address' }),
  role: z.enum(['USER', 'MANAGER', 'ADMIN']),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type AuthUserPayload = z.infer<typeof authUserPayloadSchema>

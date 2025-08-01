import { z } from 'zod'
import { passwordSchema } from '../../common/dto'

export const authInputSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: passwordSchema,
})

export type AuthInput = z.infer<typeof authInputSchema>

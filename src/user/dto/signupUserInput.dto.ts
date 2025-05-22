import { z } from 'zod'
import { passwordSchema } from '../../common/dto'

export const signupUserInputSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  username: z.string().min(5),
  password: passwordSchema,
})

export type SignupUserInput = z.infer<typeof signupUserInputSchema>

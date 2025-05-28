import { z } from 'zod'

export const newCommentInputSchema = z.object({
  text: z.string(),
})

export type NewCommentInput = z.infer<typeof newCommentInputSchema>

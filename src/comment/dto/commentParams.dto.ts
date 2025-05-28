import { z } from 'zod'

export const paramIdSchema = z.object({
  id: z.string(),
})
export const paramPostIdSchema = z.object({
  postId: z.string(),
})

export type ParamId = z.infer<typeof paramIdSchema>
export type ParamPostId = z.infer<typeof paramPostIdSchema>

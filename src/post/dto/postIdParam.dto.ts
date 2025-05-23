import { z } from 'zod'

export const postIdParamSchema = z.object({
  id: z.string(),
})

export type PostIdParam = z.infer<typeof postIdParamSchema>

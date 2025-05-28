import { type AuthUserPayload } from '../common/dto'
import { type Context } from 'hono'
import { BaseService } from '../common/services'
import { desc, eq } from 'drizzle-orm'

export class CommentService extends BaseService {
  constructor() {
    super()
  }
  public listComments = async (ctx: Context, postId: string) => {
    try {
      const commentList = await this.client.query.commentTable.findMany({
        orderBy: desc(this.schema.commentTable.createdAt),
        with: {
          userProfile: true,
          likedBy: true,
        },
      })
      return ctx.json(commentList, 200)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public createNewComment = async (
    ctx: Context,
    postId: string,
    text: string,
    user: AuthUserPayload
  ) => {
    try {
      const currentUserProfile = await this.client.query.commentTable.findFirst(
        {
          where: eq(this.schema.profileTable.userId, user.id),
        }
      )
      if (!currentUserProfile) throw ctx.json({ message: 'Not found' }, 404)
      await this.client.insert(this.schema.commentTable).values({
        postId: parseInt(postId),
        profileId: currentUserProfile.id,
        text,
      })
      return ctx.json({ message: 'Successfully created new comment.' }, 201)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
}

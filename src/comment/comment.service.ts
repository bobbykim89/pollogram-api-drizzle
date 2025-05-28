import { type AuthUserPayload } from '../common/dto'
import { Context } from 'hono'
import { BaseService } from '../common/services'
import { and, desc, eq } from 'drizzle-orm'

export class CommentService extends BaseService {
  constructor() {
    super()
  }
  public listComments = async (ctx: Context, postId: string) => {
    try {
      const commentList = await this.client.query.commentTable.findMany({
        where: eq(this.schema.commentTable.postId, parseInt(postId)),
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
      const currentUserProfile = await this.client.query.profileTable.findFirst(
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
  public deleteComment = async (
    ctx: Context,
    commentId: string,
    user: AuthUserPayload
  ) => {
    try {
      const currentUserProfile = await this.client.query.profileTable.findFirst(
        {
          where: eq(this.schema.profileTable.userId, user.id),
        }
      )
      const targetComment = await this.client.query.commentLike.findFirst({
        where: eq(this.schema.commentTable.id, parseInt(commentId)),
      })
      if (!currentUserProfile) throw ctx.json({ message: 'Not found' }, 404)
      if (!targetComment) throw ctx.json({ message: 'Not found' }, 404)
      if (
        targetComment.profileId !== currentUserProfile.id &&
        user.role === 'USER'
      )
        throw ctx.json({ message: 'Unauthorized' }, 401)
      await this.client
        .delete(this.schema.commentTable)
        .where(eq(this.schema.commentTable.id, parseInt(commentId)))
      return ctx.json({ message: 'Successfully deleted comment' }, 202)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public likeComment = async (
    ctx: Context,
    commentId: string,
    user: AuthUserPayload
  ) => {
    try {
      const currentUserProfile = await this.client.query.profileTable.findFirst(
        {
          where: eq(this.schema.profileTable.userId, user.id),
        }
      )
      const targetComment = await this.client.query.commentTable.findFirst({
        where: eq(this.schema.commentTable.id, parseInt(commentId)),
      })
      if (!currentUserProfile) throw ctx.json({ message: 'Bad request' }, 400)
      if (!targetComment) throw ctx.json({ message: 'Bad request' }, 400)
      await this.client.insert(this.schema.commentLike).values({
        commentId: targetComment.id,
        profileId: currentUserProfile.id,
      })
      return ctx.json({ message: 'Successfully liked comment' }, 201)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public unlikeComment = async (
    ctx: Context,
    commentId: string,
    user: AuthUserPayload
  ) => {
    try {
      const currentUserProfile = await this.client.query.profileTable.findFirst(
        {
          where: eq(this.schema.profileTable.userId, user.id),
        }
      )
      const targetComment = await this.client.query.commentTable.findFirst({
        where: eq(this.schema.commentTable.id, parseInt(commentId)),
      })
      if (!currentUserProfile) throw ctx.json({ message: 'Bad request' }, 400)
      if (!targetComment) throw ctx.json({ message: 'Bad request' }, 400)
      await this.client
        .delete(this.schema.commentLike)
        .where(
          and(
            eq(this.schema.commentLike.commentId, targetComment.id),
            eq(this.schema.commentLike.profileId, currentUserProfile.id)
          )
        )
      return ctx.json({ message: 'Successfully unliked comment' }, 201)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
}

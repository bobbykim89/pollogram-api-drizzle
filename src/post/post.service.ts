import { type Context } from 'hono'
import type { MultipartBody } from '../types'
import { UseMultipartData } from '../lib'
import { BaseService } from '../common/services'
import { AuthUserPayload } from '../common/dto'
import { desc, eq, and } from 'drizzle-orm'

export class PostService extends BaseService {
  private useMultipartData: UseMultipartData
  constructor() {
    super()
    this.useMultipartData = new UseMultipartData()
  }
  public getPostList = async (ctx: Context) => {
    try {
      const postList = await this.client.query.postTable.findMany({
        orderBy: desc(this.schema.postTable.createdAt),
      })
      return ctx.json(postList, 200)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public getPostDetail = async (ctx: Context, id: string) => {
    try {
      const currentPost = await this.client.query.postTable.findFirst({
        where: eq(this.schema.postTable.id, parseInt(id)),
        with: {
          comments: true,
          likedBy: true,
          userProfile: true,
        },
      })
      if (!currentPost) throw ctx.json({ message: 'Not found' }, 404)
      return ctx.json(currentPost, 200)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public createPost = async (
    ctx: Context,
    user: AuthUserPayload,
    body: MultipartBody
  ) => {
    try {
      const currentUserProfile = await this.client.query.profileTable.findFirst(
        {
          where: eq(this.schema.profileTable.userId, user.id),
        }
      )
      if (!currentUserProfile) throw ctx.json({ message: 'Not found' }, 404)
      const cloudinaryRes = await this.useMultipartData.uploadCloudinary(
        ctx,
        body['image'],
        'post'
      )
      const bodyText: string =
        typeof body['text'] === 'string' ? body['text'] : ''
      if (!cloudinaryRes)
        throw ctx.json({ message: 'Failed to upload image.' }, 408)
      await this.client.insert(this.schema.postTable).values({
        profileId: currentUserProfile.id,
        imageId: cloudinaryRes.image_id,
        text: bodyText,
      })
      return ctx.json({ message: 'Successfully created a new post' }, 201)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error', error }, 500)
    }
  }
  public deletePost = async (
    ctx: Context,
    user: AuthUserPayload,
    id: string
  ) => {
    try {
      const currentUserProfile = await this.client.query.profileTable.findFirst(
        {
          where: eq(this.schema.profileTable.userId, user.id),
        }
      )
      const targetPost = await this.client.query.postTable.findFirst({
        where: eq(this.schema.postTable.id, parseInt(id)),
      })
      if (!targetPost) throw ctx.json({ message: 'Bad request' }, 400)
      if (
        targetPost.profileId !== currentUserProfile?.id ||
        (user.role !== 'MANAGER' && user.role !== 'ADMIN')
      )
        throw ctx.json({ message: 'Unauthorized' }, 401)
      await this.client
        .delete(this.schema.postTable)
        .where(eq(this.schema.postTable.id, targetPost.id))
      await this.useMultipartData.deleteCloudinaryImage(targetPost.imageId)
      return ctx.json({ message: 'Successfully deleted post.' }, 203)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public likePost = async (
    ctx: Context,
    postId: string,
    user: AuthUserPayload
  ) => {
    try {
      const currentUserProfile = await this.client.query.profileTable.findFirst(
        {
          where: eq(this.schema.profileTable.userId, user.id),
        }
      )
      const targetPost = await this.client.query.postTable.findFirst({
        where: eq(this.schema.postTable.id, parseInt(postId)),
      })
      if (!targetPost) throw ctx.json({ message: 'Bad request' }, 400)
      if (targetPost.profileId !== currentUserProfile?.id)
        throw ctx.json({ message: 'Unauthorized' }, 401)
      await this.client.insert(this.schema.postLike).values({
        postId: targetPost.id,
        profileId: currentUserProfile.id,
      })
      return ctx.json({ message: 'Successfully liked the post' }, 201)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public unlikePost = async (
    ctx: Context,
    postId: string,
    user: AuthUserPayload
  ) => {
    try {
      const currentUserProfile = await this.client.query.profileTable.findFirst(
        {
          where: eq(this.schema.profileTable.userId, user.id),
        }
      )
      const targetPost = await this.client.query.postTable.findFirst({
        where: eq(this.schema.postTable.id, parseInt(postId)),
      })
      if (!targetPost) throw ctx.json({ message: 'Bad request' }, 400)
      if (targetPost.profileId !== currentUserProfile?.id)
        throw ctx.json({ message: 'Unauthorized' }, 401)
      await this.client
        .delete(this.schema.postLike)
        .where(
          and(
            eq(this.schema.postLike.postId, targetPost.id),
            eq(this.schema.postLike.profileId, currentUserProfile.id)
          )
        )
      return ctx.json({ message: 'Successfully liked the post' }, 201)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
}

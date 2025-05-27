import { and, desc, eq } from 'drizzle-orm'
import type { AuthUserPayload } from '../common/dto'
import type { Context } from 'hono'
import type {
  ProfileDescriptionUpdateInput,
  ProfileUsernameUpdateInput,
} from './dto'
import type { MultipartBody } from '../types'
import { UseMultipartData } from '../lib'
import { BaseService } from '../common/services'

export class ProfileService extends BaseService {
  private useMultipartData: UseMultipartData
  constructor() {
    super()
    this.useMultipartData = new UseMultipartData()
  }
  public getProfileList = async (ctx: Context) => {
    try {
      const profileList = await this.client.query.profileTable.findMany({
        orderBy: desc(this.schema.profileTable.createdAt),
      })
      return ctx.json(profileList, 200)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public getCurrentUserProfile = async (
    ctx: Context,
    user: AuthUserPayload
  ) => {
    try {
      const currentUserProfile = await this.client.query.profileTable.findFirst(
        {
          where: eq(this.schema.profileTable.userId, user.id),
          with: {
            posts: true,
            followedBy: true,
            following: true,
            likedPosts: true,
            likedComments: true,
          },
        }
      )
      if (!currentUserProfile) throw ctx.json({ message: 'Not found' }, 404)
      return ctx.json(currentUserProfile, 200)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public getProfileById = async (ctx: Context, id: string) => {
    try {
      const userProfile = await this.client.query.profileTable.findFirst({
        where: eq(this.schema.profileTable.id, parseInt(id)),
        with: {
          posts: true,
          followedBy: true,
          following: true,
          likedPosts: true,
          likedComments: true,
        },
      })
      if (!userProfile) throw ctx.json({ message: 'Not found' }, 404)
      return ctx.json(userProfile, 200)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public updateUsername = async (
    ctx: Context,
    body: ProfileUsernameUpdateInput,
    user: AuthUserPayload
  ) => {
    try {
      const { username } = body
      const currentUserProfile = await this.client.query.profileTable.findFirst(
        { where: eq(this.schema.profileTable.userId, user.id) }
      )
      if (!currentUserProfile) throw ctx.json({ message: 'Not found' }, 404)
      await this.client
        .update(this.schema.profileTable)
        .set({ username })
        .where(eq(this.schema.profileTable.id, currentUserProfile.id))
      return ctx.json({ message: 'Successfully updated profile' }, 201)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public updateProfileDescription = async (
    ctx: Context,
    body: ProfileDescriptionUpdateInput,
    user: AuthUserPayload
  ) => {
    try {
      const { description } = body
      const currentUserProfile = await this.client.query.profileTable.findFirst(
        {
          where: eq(this.schema.profileTable.userId, user.id),
        }
      )
      if (!currentUserProfile) throw ctx.json({ message: 'Not found' }, 404)
      await this.client
        .update(this.schema.profileTable)
        .set({ profileDescription: description })
        .where(eq(this.schema.profileTable.id, currentUserProfile.id))
      return ctx.json({ message: 'Successfully updated profile' }, 201)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public updateProfileImage = async (
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
      const claudinaryRes = await this.useMultipartData.uploadCloudinary(
        ctx,
        body['image'],
        'profile'
      )
      if (!claudinaryRes)
        throw ctx.json({ message: 'Failed to upload image.' }, 408)
      await this.client
        .update(this.schema.profileTable)
        .set({ imageId: claudinaryRes.image_id })
        .where(eq(this.schema.profileTable.id, currentUserProfile.id))
      return ctx.json({ message: 'Successfully updated profile' }, 203)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public followUser = async (
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
      if (!currentUserProfile) throw ctx.json({ message: 'Not found' }, 404)
      const targetUserProfile = await this.client.query.profileTable.findFirst({
        where: eq(this.schema.profileTable.id, parseInt(id)),
      })
      if (!targetUserProfile) throw ctx.json({ message: 'Not found' }, 404)
      await this.client.insert(this.schema.follow).values({
        followedById: currentUserProfile.id,
        followingId: targetUserProfile.id,
      })
      return ctx.json({ message: 'Successfully followed user.' }, 201)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public unfollowUser = async (
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
      if (!currentUserProfile) throw ctx.json({ message: 'Not found' }, 404)
      const targetUserProfile = await this.client.query.profileTable.findFirst({
        where: eq(this.schema.profileTable.id, parseInt(id)),
      })
      if (!targetUserProfile) throw ctx.json({ message: 'Not found' }, 404)
      await this.client
        .delete(this.schema.follow)
        .where(
          and(
            eq(this.schema.follow.followedById, currentUserProfile.id),
            eq(this.schema.follow.followingId, targetUserProfile.id)
          )
        )
      return ctx.json({ message: 'Successfully unfollowed user.' }, 201)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
}

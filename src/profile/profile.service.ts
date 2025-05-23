import { desc, eq } from 'drizzle-orm'
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
}

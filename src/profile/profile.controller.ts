import { Hono } from 'hono'
import { every } from 'hono/combine'
import { zValidator } from '@hono/zod-validator'
import { UseAuth } from '../lib'
import { AppContextType } from '../types'
import {
  profileUsernameUpdateInputSchema,
  profileDescriptionUpdateInputSchema,
} from './dto'
import { ProfileService } from './profile.service'
import { z } from 'zod'

export class ProfieController {
  private profileService: ProfileService
  private useAuth: UseAuth
  private app: Hono<{ Variables: AppContextType }>
  constructor() {
    this.profileService = new ProfileService()
    this.useAuth = new UseAuth()
    this.app = new Hono()
  }
  public setRoute = () => {
    return this.app
      .get('/', this.useAuth.getJwt, async (c) => {
        return this.profileService.getProfileList(c)
      })
      .get(
        '/current-user/',
        every(this.useAuth.getJwt, this.useAuth.retrieveUserInfo),
        async (c) => {
          const user = c.get('currentUser')
          return await this.profileService.getCurrentUserProfile(c, user)
        }
      )
      .put(
        '/current-user/edit/username/',
        every(this.useAuth.getJwt, this.useAuth.retrieveUserInfo),
        zValidator('json', profileUsernameUpdateInputSchema),
        async (c) => {
          const user = c.get('currentUser')
          const body = c.req.valid('json')
          return await this.profileService.updateUsername(c, body, user)
        }
      )
      .put(
        '/current-user/edit/description/',
        every(this.useAuth.getJwt, this.useAuth.retrieveUserInfo),
        zValidator('json', profileDescriptionUpdateInputSchema),
        async (c) => {
          const user = c.get('currentUser')
          const body = c.req.valid('json')
          return await this.profileService.updateProfileDescription(
            c,
            body,
            user
          )
        }
      )
      .put(
        '/current-user/edit/profile-image/',
        every(this.useAuth.getJwt, this.useAuth.retrieveUserInfo),
        async (c) => {
          const body = await c.req.parseBody()
          const user = c.get('currentUser')
          return await this.profileService.updateProfileImage(c, user, body)
        }
      )
      .get(
        '/:id/',
        this.useAuth.getJwt,
        zValidator('param', z.object({ id: z.string() })),
        async (c) => {
          const { id } = c.req.valid('param')
          return await this.profileService.getProfileById(c, id)
        }
      )
      .post(
        '/:id/follow/',
        every(this.useAuth.getJwt, this.useAuth.retrieveUserInfo),
        zValidator('param', z.object({ id: z.string() })),
        async (c) => {
          const user = c.get('currentUser')
          const { id } = c.req.valid('param')
          return await this.profileService.followUser(c, user, id)
        }
      )
      .delete(
        '/:id/follow/',
        every(this.useAuth.getJwt, this.useAuth.retrieveUserInfo),
        zValidator('param', z.object({ id: z.string() })),
        async (c) => {
          const user = c.get('currentUser')
          const { id } = c.req.valid('param')
          return await this.profileService.unfollowUser(c, user, id)
        }
      )
  }
}

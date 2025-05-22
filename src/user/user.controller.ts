import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { UseAuth } from '../lib'
import { AppContextType } from '../types'
import { UserService } from './user.service'
import { pwUpdateInputSchema, signupUserInputSchema } from './dto'

export class UserController {
  private userService: UserService
  private useAuth: UseAuth
  private app: Hono<{ Variables: AppContextType }>
  constructor() {
    this.userService = new UserService()
    this.useAuth = new UseAuth()
    this.app = new Hono()
  }
  public setRoute = () => {
    return this.app
      .get('/', async (c) => {
        return await this.userService.helloFromPollito(c)
      })
      .post(
        '/signup/',
        zValidator('json', signupUserInputSchema),
        async (c) => {
          const body = c.req.valid('json')
          return await this.userService.signupUser(c, body)
        }
      )
      .put(
        '/change-password/',
        this.useAuth.getJwt,
        zValidator('json', pwUpdateInputSchema),
        async (c) => {
          const body = c.req.valid('json')
          const token = c.get('jwtPayload')
          return await this.userService.updatePassword(c, body, token)
        }
      )
  }
}

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { UseAuth } from '../lib'
import { AppContextType } from '../types'
import { authInputSchema } from './dto'
import { AuthService } from './auth.service'

export class AuthController {
  private authService: AuthService
  private useAuth: UseAuth
  private app: Hono<{ Variables: AppContextType }>
  constructor() {
    this.authService = new AuthService()
    this.useAuth = new UseAuth()
    this.app = new Hono()
  }
  public setRoute = () => {
    return this.app
      .get('/', this.useAuth.getJwt, async (c) => {
        const token = c.get('jwtPayload')
        return await this.authService.getCurrentUser(c, token)
      })
      .post('/login/', zValidator('json', authInputSchema), async (c) => {
        const body = c.req.valid('json')
        return await this.authService.loginUser(c, body)
      })
  }
}

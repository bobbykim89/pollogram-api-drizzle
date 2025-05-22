import { sign, jwt } from 'hono/jwt'
import { createMiddleware } from 'hono/factory'
import * as bcrypt from 'bcryptjs'
import { BaseService } from '../common/services/base.service'
import { AppContextType } from '../types'
import { eq } from 'drizzle-orm'

export class UseAuth extends BaseService {
  constructor() {
    super()
  }
  public signToken = async (userId: number) => {
    const payload = {
      id: userId,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    }
    return await sign(payload, this.config.jwtSecret)
  }
  public getJwt = createMiddleware<{ Variables: AppContextType }>(
    async (c, next) => {
      const jwtmiddleware = jwt({ secret: this.config.jwtSecret })
      return jwtmiddleware(c, next)
    }
  )
  public hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
  }
  public retrieveUserInfo = createMiddleware<{ Variables: AppContextType }>(
    async (c, next) => {
      try {
        const user = c.get('jwtPayload')
        const currentUser = await this.client.query.usersTable.findFirst({
          where: eq(this.schema.usersTable.id, user.id),
          columns: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            password: false,
          },
        })
        if (!currentUser) return c.json({ error: 'Not found' }, 404)
        c.set('currentUser', currentUser)
        return next()
      } catch (error) {
        throw c.json({ error: 'Unauthorized' }, 401)
      }
    }
  )
}

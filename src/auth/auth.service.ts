import type { Context } from 'hono'
import { UseAuth } from '../lib'
import type { AuthInput } from './dto'
import type { TokenPayload } from '../common/dto'
import * as bcrypt from 'bcryptjs'
import { BaseService } from '../common/services'
import { eq } from 'drizzle-orm'

export class AuthService extends BaseService {
  private useAuth: UseAuth
  constructor() {
    super()
    this.useAuth = new UseAuth()
  }
  public getCurrentUser = async (ctx: Context, token: TokenPayload) => {
    try {
      const currentUser = await this.client.query.usersTable.findFirst({
        where: eq(this.schema.usersTable.id, token.id),
        columns: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          password: false,
        },
      })
      if (!currentUser) throw ctx.json({ message: 'Not found' }, 404)
      return ctx.json(currentUser, 200)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public loginUser = async (ctx: Context, dto: AuthInput) => {
    try {
      const { email, password } = dto
      const user = await this.client.query.usersTable.findFirst({
        where: eq(this.schema.usersTable.email, email),
      })
      if (!user) throw ctx.json({ message: 'Validation error.' }, 403)
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) throw ctx.json({ message: 'Validation error.' }, 403)
      const accessToken = await this.useAuth.signToken(user.id)
      return ctx.json({ access_token: `Bearer ${accessToken}` }, 201)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
}

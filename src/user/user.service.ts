import type { Context } from 'hono'
import * as bcrypt from 'bcryptjs'
import { UseAuth } from '../lib'
import type { TokenPayload } from '../common/dto'
import { BaseService } from '../common/services'
import type { PwUpdateInput, SignupUserInput } from './dto'
import { eq, sql } from 'drizzle-orm'

export class UserService extends BaseService {
  private useAuth: UseAuth
  constructor() {
    super()
    this.useAuth = new UseAuth()
  }
  public helloFromPollito = async (ctx: Context) => {
    return ctx.json({ message: 'Hello from pollito!' }, 200)
  }
  public signupUser = async (ctx: Context, dto: SignupUserInput) => {
    try {
      const { email, password, username } = dto
      let user = await this.client.query.usersTable.findFirst({
        where: eq(this.schema.usersTable.email, email),
      })
      let profile = await this.client.query.profileTable.findFirst({
        where: eq(this.schema.profileTable.username, username),
      })
      if (user || profile)
        return ctx.json({ message: 'Email or username is already in use' }, 400)
      const hashedPassword = await this.useAuth.hashPassword(password)
      const [newUser] = await this.client
        .insert(this.schema.usersTable)
        .values({
          email,
          password: hashedPassword,
        })
        .returning()
      const [newProfile] = await this.client
        .insert(this.schema.profileTable)
        .values({
          username,
          userId: newUser.id,
        })
        .returning()
      const accessToken = await this.useAuth.signToken(newUser.id)
      return ctx.json({ access_token: `Bearer ${accessToken}` }, 201)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public updatePassword = async (
    ctx: Context,
    dto: PwUpdateInput,
    token: TokenPayload
  ) => {
    try {
      const currentUser = await this.client.query.usersTable.findFirst({
        where: eq(this.schema.usersTable.id, token.id),
      })
      const { currentPassword, newPassword } = dto
      if (!currentUser) return ctx.json({ message: 'Not found' }, 404)
      const isMatch = await bcrypt.compare(
        currentPassword,
        currentUser.password
      )
      if (!isMatch) return ctx.json({ message: 'Validation error' }, 403)
      const hashedNewPw = await this.useAuth.hashPassword(newPassword)
      await this.client
        .update(this.schema.usersTable)
        .set({ password: hashedNewPw, updatedAt: sql`NOW()` })
        .where(eq(this.schema.usersTable.id, currentUser.id))
      return ctx.json({ message: 'Updated password successfully' }, 201)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
}

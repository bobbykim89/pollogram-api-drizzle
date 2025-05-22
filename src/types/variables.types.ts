import { type JwtVariables } from 'hono/jwt'
import { type AuthUserPayload } from '../common/dto'

export interface AppContextType extends JwtVariables {
  currentUser: AuthUserPayload
}

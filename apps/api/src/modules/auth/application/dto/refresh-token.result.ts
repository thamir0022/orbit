import { AuthenticatedUser, Tokens } from '../interfaces/auth.interface'

export interface RefreshTokenResult {
  user: AuthenticatedUser
  tokens: Tokens
  sessionId: string
}

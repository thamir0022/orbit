import { AuthenticatedUser, Tokens } from '../interfaces/auth.interface'

export interface OAuthResult {
  user: AuthenticatedUser
  tokens: Tokens
  sessionId: string
}

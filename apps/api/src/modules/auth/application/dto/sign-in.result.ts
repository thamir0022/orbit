import { AuthenticatedUser, Tokens } from '../interfaces/auth.interface'

export interface SignInResult {
  user: AuthenticatedUser
  tokens: Tokens
  sessionId: string
}

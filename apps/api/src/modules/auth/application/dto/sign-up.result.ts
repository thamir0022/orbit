import { AuthenticatedUser, Tokens } from '../interfaces/auth.interface'

export interface SignUpResult {
  user: AuthenticatedUser
  tokens: Tokens
  sessionId: string
}

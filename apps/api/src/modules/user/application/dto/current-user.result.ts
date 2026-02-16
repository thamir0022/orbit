import { AuthenticatedUser } from '@/modules/auth'

export interface CurrentUserResult {
  user: AuthenticatedUser
  accessToken: string
}

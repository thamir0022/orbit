import { AuthenticatedUser } from '@/modules/auth'

export interface CurrentUserResponseDto {
  user: AuthenticatedUser
}

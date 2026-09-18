import { AuthenticatedUser } from '@/modules/user/application/contracts/authenticated-user.interface'

export interface ChangePasswordResponseDto {
  user: AuthenticatedUser
}

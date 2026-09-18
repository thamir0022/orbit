import { AuthenticatedUser } from '@/modules/user/application/contracts/authenticated-user.interface'

export interface ChangePasswordOutputDto {
  user: AuthenticatedUser
}

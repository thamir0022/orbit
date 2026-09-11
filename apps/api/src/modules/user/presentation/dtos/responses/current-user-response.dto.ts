import { AuthenticatedUser } from '../../../application/contracts/authenticated-user.interface'

export class CurrentUserResponseDto {
  user!: AuthenticatedUser
}

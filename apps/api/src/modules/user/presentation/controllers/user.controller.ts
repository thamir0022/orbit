import { Controller, Get, Inject } from '@nestjs/common'
import {
  GET_CURRENT_USER,
  type IGetCurrentUserUseCase,
} from '../../application/usecases/get-current-user.interface'
import { CurrentUser } from '@/shared/presentation/decorators/current-user.decorator'
import { type AuthenticatedUser } from '@/modules/auth/application/interfaces/authenticated-user.interface'

@Controller('users')
export class UserController {
  constructor(
    @Inject(GET_CURRENT_USER)
    private readonly _getCurrentUser: IGetCurrentUserUseCase
  ) {}

  @Get('me')
  async getCurrentUser(@CurrentUser() currentUser: AuthenticatedUser) {
    return this._getCurrentUser.execute({ userId: currentUser.id })
  }
}

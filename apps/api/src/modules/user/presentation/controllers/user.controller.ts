import { Controller, Get, Headers, Inject, Ip } from '@nestjs/common'
import {
  GET_CURRENT_USER,
  type IGetCurrentUserUseCase,
} from '../../application/usecases/get-current-user.interface'
import { Cookies } from '@/shared/presentation/decorators/cookie.decorator'

@Controller('users')
export class UserController {
  constructor(
    @Inject(GET_CURRENT_USER)
    private readonly _getCurrentUser: IGetCurrentUserUseCase
  ) {}

  @Get('me')
  async getCurrentUser(
    @Headers('user-agent') userAgent: string,
    @Ip() ipAddress: string,
    @Cookies('refresh_token') refreshToken: string
  ) {
    const { accessToken, user } = await this._getCurrentUser.execute({
      refreshToken,
      clientInfo: { userAgent, ipAddress },
    })

    return { user, accessToken }
  }
}

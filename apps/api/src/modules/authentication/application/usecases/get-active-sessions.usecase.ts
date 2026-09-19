import { Inject, Injectable } from '@nestjs/common'
import { AUTH_SERVICE, IAuthService } from '../services/auth.service.interface'
import { UserId } from '@/modules/user/domain'
import { SessionMapper } from '../mappers'
import { IGetActiveSessionsUseCase } from './get-active-sessions.interface'
import { GetActiveSessionsInputDto, GetActiveSessionsOutputDto } from '../dto'

@Injectable()
export class GetActiveSessionsUseCase implements IGetActiveSessionsUseCase {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService
  ) {}

  async execute(
    input: GetActiveSessionsInputDto
  ): Promise<GetActiveSessionsOutputDto> {
    const userId = UserId.create(input.userId)

    const sessions = await this.authService.getAllUserSession(userId.value)

    if (!sessions) return { sessions: null, total: 0 }

    return {
      sessions: sessions.map((session) =>
        SessionMapper.toActiveSession(session, input.sid)
      ),
      total: sessions.length,
    }
  }
}

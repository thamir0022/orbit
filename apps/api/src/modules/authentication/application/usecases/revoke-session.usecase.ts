import { Inject, Injectable } from '@nestjs/common'
import { IRevokeSessionUseCase } from './revoke-session.interface'
import { RevokeSessionInputDto } from '../dto'
import { AUTH_SERVICE, IAuthService } from '../services/auth.service.interface'
import { InvalidSessionException } from '../../domain/exceptions/auth.exception'

@Injectable()
export class RevokeSessionUseCase implements IRevokeSessionUseCase {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService
  ) {}

  async execute({ publicId, userId }: RevokeSessionInputDto): Promise<void> {
    const session = await this.authService.getSessionByPublicId({
      publicId,
      userId,
    })

    if (!session || session.userId !== userId)
      throw new InvalidSessionException()

    await this.authService.revokeSession(session.sid)
  }
}

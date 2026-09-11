import { Inject, Logger } from '@nestjs/common'
import { SignOutInputDto } from '../dto'
import {
  AUTH_SERVICE,
  type IAuthService,
} from '../services/auth.service.interface'
import { ISignOutUseCase } from './sign-out.interface'

export class SignOutUseCase implements ISignOutUseCase {
  private readonly logger = new Logger(SignOutUseCase.name)

  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: IAuthService
  ) {}
  async execute({ sid }: SignOutInputDto): Promise<void> {
    await this.authService.revokeSession(sid)

    this.logger.log(`Revoked session for user ${sid}`)
  }
}

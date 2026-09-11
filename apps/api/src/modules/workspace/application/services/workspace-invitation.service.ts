import { Inject, Injectable } from '@nestjs/common'
import { createHash, randomBytes } from 'crypto'
import { IWorkspaceInvitationService } from './workspace-invitation.service.interface'
import { APP_CONFIG, type IAppConfig } from '@/shared/infrastructure'

@Injectable()
export class WorkspaceInvitationService implements IWorkspaceInvitationService {
  constructor(
    @Inject(APP_CONFIG)
    private readonly config: IAppConfig
  ) {}

  generateToken(): string {
    return randomBytes(32).toString('hex')
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }

  verifyToken(rawToken: string, storedHash: string): boolean {
    return this.hashToken(rawToken) === storedHash
  }

  buildInvitationUrl(token: string): string {
    const frontendUrl = this.config.frontEndUrl

    return `${frontendUrl}/invite/${token}`
  }
}

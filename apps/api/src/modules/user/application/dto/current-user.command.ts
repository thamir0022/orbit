import { ClientInfo } from '@/modules/auth'

export interface CurrentUserCommand {
  refreshToken: string
  clientInfo: ClientInfo
}

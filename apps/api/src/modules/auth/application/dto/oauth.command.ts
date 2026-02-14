import { AuthProvider } from '@/modules/user/domain'
import { ClientInfo } from '../interfaces/auth.interface'

export interface OAuthCommand {
  provider: AuthProvider
  code: string
  clientInfo: ClientInfo
}

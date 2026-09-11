import { AuthProvider } from '@/modules/user/domain'
import { ClientInfo } from '../contracts/client-info'

export interface OAuthInputDto {
  provider: AuthProvider
  code: string
  clientInfo: ClientInfo
}

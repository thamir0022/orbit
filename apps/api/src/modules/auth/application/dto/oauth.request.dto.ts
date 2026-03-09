import { AuthProvider } from '@/modules/user/domain'
import { ClientInfo } from '../interfaces/auth.interface'

export interface OAuthRequestDto {
  provider: AuthProvider
  code: string
  clientInfo: ClientInfo
}

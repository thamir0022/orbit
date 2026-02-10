import { User } from '@/modules/user/domain'

export interface ClientInfo {
  ipAddress: string
  userAgent: string
}

export interface SignInCommand {
  user: User
  clientInfo: ClientInfo
}

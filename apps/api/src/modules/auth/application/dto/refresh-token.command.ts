import { ClientInfo } from '../interfaces/auth.interface'

export interface RefreshTokenCommand {
  refreshToken: string
  clientInfo: ClientInfo
}
